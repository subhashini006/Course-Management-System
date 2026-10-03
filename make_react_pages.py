"""
Converts the original StudyVerse static HTML pages into React page
components. Reads each real .html file from extracted/, keeps its body
markup (ids/classes intact so the untouched legacy app.js keeps finding
the elements it expects), and writes one .jsx file per page into
react-frontend/src/pages/.
"""

from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment
import json
import re

SRC = Path("/home/claude/work/extracted")
PAGES = Path("/home/claude/work/react-frontend/src/pages")
PAGES.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------
# Page registry: html file -> (ComponentName, [route paths], page title)
# Route paths mirror the original filenames (with and without .html)
# so every existing href="x.html" / window.location.href = "x.html"
# in the untouched legacy JS keeps working without modification.
# ---------------------------------------------------------------------
PAGES_REGISTRY = {
    "index.html":            ("Home",              ["/", "/index.html"]),
    "login-choice.html":     ("LoginChoice",        ["/login-choice", "/login-choice.html"]),
    "stu-login.html":        ("StudentLogin",       ["/stu-login", "/stu-login.html"]),
    "stu-register.html":     ("StudentRegister",    ["/stu-register", "/stu-register.html"]),
    "admin-login.html":      ("AdminLogin",         ["/admin-login", "/admin-login.html"]),
    "add-course.html":       ("AddCourseGate",      ["/add-course", "/add-course.html"]),
    "add-course-edit.html":  ("AddCourseEditGate",  ["/add-course-edit", "/add-course-edit.html"]),
    "edit-course-login.html":("EditCourseLogin",    ["/edit-course-login", "/edit-course-login.html"]),
    "notification.html":     ("AddCourseForm",      ["/notification", "/notification.html"]),
    "edit-course.html":      ("EditCourse",         ["/edit-course", "/edit-course.html"]),
    "admin-dashboard.html":  ("AdminDashboard",     ["/admin-dashboard", "/admin-dashboard.html"]),
    "stu-dashboard.html":    ("StudentDashboard",   ["/stu-dashboard", "/stu-dashboard.html"]),
    "courses.html":          ("Courses",            ["/courses", "/courses.html"]),
    "course.html":           ("Course",             ["/course", "/course.html"]),
    "certificate.html":      ("Certificate",        ["/certificate", "/certificate.html"]),
    "forgot-password.html":  ("ForgotPassword",     ["/forgot-password", "/forgot-password.html"]),
    "reset-password.html":   ("ResetPassword",      ["/reset-password", "/reset-password.html"]),
}

# href target -> route used for <Link to="...">. Query strings on the
# original href (e.g. edit-course-login.html?course=ml1) are preserved
# by appending them back onto the resolved route.
HREF_ROUTE = {fname: routes[0] for fname, (_, routes) in PAGES_REGISTRY.items()}

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

ATTRIBUTE_MAP = {
    "class": "className",
    "for": "htmlFor",
    "tabindex": "tabIndex",
    "readonly": "readOnly",
    "maxlength": "maxLength",
    "minlength": "minLength",
    "autocomplete": "autoComplete",
    "colspan": "colSpan",
    "rowspan": "rowSpan",
    "crossorigin": "crossOrigin",
    "novalidate": "noValidate",
    "srcset": "srcSet",
    "autofocus": "autoFocus",
}

# Known inline event handlers from the original HTML, translated to
# explicit React handlers that call the (untouched) global functions
# app.js defines on window. Anything not in this table falls back to a
# generic window.eval bridge so nothing is silently dropped.
HANDLER_MAP = {
    ("onclick", "resetEnrollments()"):
        ("onClick", "() => window.resetEnrollments()"),
    ("onclick", "logoutStudent(); return false;"):
        ("onClick", "(e) => { e.preventDefault(); window.logoutStudent(); }"),
    ("onclick", "window.print()"):
        ("onClick", "() => window.print()"),
    ("onchange", "handleVideoToggle()"):
        ("onChange", "() => window.handleVideoToggle()"),
    ("onclick", "openEnrollModal(this)"):
        ("onClick", "(e) => window.openEnrollModal(e.currentTarget)"),
    ("onclick", "closeEnrollModal()"):
        ("onClick", "() => window.closeEnrollModal()"),
    ("onsubmit", "return submitEnrollment(event)"):
        ("onSubmit", "(e) => { const keepGoing = window.submitEnrollment(e); if (keepGoing === false) e.preventDefault(); }"),
    ("onclick", "addLearnItem()"):
        ("onClick", "() => window.addLearnItem()"),
}


def quote(value):
    return json.dumps(str(value), ensure_ascii=False)


def convert_style(value):
    if not isinstance(value, str):
        return "{}"
    properties = []
    for item in value.split(";"):
        if ":" not in item:
            continue
        key, val = item.split(":", 1)
        key = key.strip()
        val = val.strip()
        if not key:
            continue
        key = re.sub(r"-([a-zA-Z])", lambda m: m.group(1).upper(), key)
        properties.append(f"{key}: {quote(val)}")
    return "{" + ", ".join(properties) + "}"


def convert_text(value):
    value = str(value)
    value = value.replace("{", "{'{'}").replace("}", "{'}'}")
    return value


def resolve_link(href):
    """Return (route, is_internal) for a given href value."""
    if not href:
        return None, False
    base, sep, query = href.partition("?")
    if base in HREF_ROUTE:
        route = HREF_ROUTE[base]
        if query:
            route = f"{route}?{query}"
        return route, True
    return href, False


def convert_attributes(node, skip=()):
    attrs = []
    for key, value in node.attrs.items():
        if key in skip:
            continue
        if key == "style":
            attrs.append(f"style={{{convert_style(value)}}}")
            continue
        if key.startswith("on") and isinstance(value, str):
            mapped = HANDLER_MAP.get((key, value.strip()))
            if mapped:
                event_name, handler_code = mapped
                attrs.append(f"{event_name}={{{handler_code}}}")
            else:
                attrs.append(f"{key}={{() => window.eval({quote(value)})}}")
            continue
        new_key = ATTRIBUTE_MAP.get(key, key)
        if isinstance(value, list):
            value = " ".join(value)
        if value is None or value == key:
            attrs.append(new_key)
            continue
        attrs.append(f"{new_key}={quote(value)}")
    if not attrs:
        return ""
    return " " + " ".join(attrs)


def convert_node(node, level):
    indent = "    " * level

    if isinstance(node, Comment):
        text = str(node).strip()
        if not text:
            return ""
        return f"{indent}{{/* {text} */}}"

    if isinstance(node, NavigableString):
        stripped = str(node).strip()
        # A lone "<" is a stray typo character in the original markup
        # (e.g. "<<img ...>"), not real content; a bare "<" is also not
        # valid JSX text, so drop it rather than emit broken output.
        if stripped == "<":
            return ""
        text_value = convert_text(node)
        if not text_value.strip():
            return ""
        return indent + text_value.strip("\n")

    if not getattr(node, "name", None):
        return ""

    if node.name in ("script",):
        return ""

    if node.name == "a":
        href = node.get("href")
        route, is_internal = resolve_link(href)
        if is_internal:
            # IMPORTANT: this stays a real <a href> (full browser
            # navigation), not a React Router <Link>. app.js has
            # top-level `const` declarations; re-injecting it after a
            # client-side-only route change (no real page load) would
            # throw "already declared" the second time any page is
            # revisited. A real navigation gives every page a fresh JS
            # realm, exactly like the original multi-page site, so
            # app.js keeps working untouched. React Router still picks
            # the right component for whichever URL is requested.
            node["href"] = route
        # fall through to normal element handling below

    tag_name = node.name
    attribute_text = convert_attributes(node)

    if tag_name in VOID_TAGS:
        return f"{indent}<{tag_name}{attribute_text} />"

    children = [convert_node(c, level + 1) for c in node.children]
    children = [c for c in children if c]

    if not children:
        return f"{indent}<{tag_name}{attribute_text}></{tag_name}>"

    if len(children) == 1 and "\n" not in children[0] and not children[0].lstrip().startswith("<"):
        return f"{indent}<{tag_name}{attribute_text}>{children[0].strip()}</{tag_name}>"

    return (
        f"{indent}<{tag_name}{attribute_text}>\n"
        + "\n".join(children)
        + f"\n{indent}</{tag_name}>"
    )


def build_component(html_file):
    page_filename = html_file.name
    component_name, routes = PAGES_REGISTRY[page_filename]

    html = html_file.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    page_title = title_tag.get_text().strip() if title_tag else "StudyVerse"

    body = soup.body
    body_class = body.get("class") if body else None
    if isinstance(body_class, list):
        body_class = " ".join(body_class)
    if not body_class:
        body_class = ""
    body_page = body.get("data-page") if body else None

    content_nodes = [c for c in body.children] if body else []
    content_lines = []
    for child in content_nodes:
        converted = convert_node(child, 3)
        if converted:
            content_lines.append(converted)
    content_text = "\n".join(content_lines)

    uses_link = "<Link " in content_text

    imports = [
        'import PageMeta from "../components/PageMeta";',
        'import LegacyScript from "../components/LegacyScript";',
    ]
    if uses_link:
        imports.insert(0, 'import { Link } from "react-router-dom";')

    if body_page:
        page_meta_props = f'bodyClassName={quote(body_class)} page={quote(body_page)} title={quote(page_title)}'
    else:
        page_meta_props = f'bodyClassName={quote(body_class)} title={quote(page_title)}'

    component_code = "\n".join(imports) + "\n\n"
    component_code += f"export default function {component_name}() {{\n"
    component_code += "    return (\n"
    component_code += "        <>\n"
    component_code += f"            <PageMeta {page_meta_props} />\n"
    if content_text:
        component_code += content_text + "\n"
    component_code += "            <LegacyScript />\n"
    component_code += "        </>\n"
    component_code += "    );\n"
    component_code += "}\n"

    output_file = PAGES / f"{component_name}.jsx"
    output_file.write_text(component_code, encoding="utf-8")
    print("Created:", output_file, "-> routes:", routes)
    return component_name, routes


def main():
    generated = []
    for html_file in sorted(SRC.glob("*.html")):
        if html_file.name not in PAGES_REGISTRY:
            print("Skipping (not in registry):", html_file.name)
            continue
        generated.append(build_component(html_file))

    # Emit App.jsx with all routes wired up
    app_imports = []
    app_routes = []
    for component_name, routes in generated:
        app_imports.append(f'import {component_name} from "./pages/{component_name}.jsx";')
        for route in routes:
            app_routes.append((route, component_name))

    app_code = 'import { Routes, Route } from "react-router-dom";\n'
    app_code += "\n".join(app_imports) + "\n\n"
    app_code += "function App() {\n"
    app_code += "    return (\n"
    app_code += "        <Routes>\n"
    for route, component_name in app_routes:
        app_code += f'            <Route path={quote(route)} element={{<{component_name} />}} />\n'
    app_code += "        </Routes>\n"
    app_code += "    );\n"
    app_code += "}\n\n"
    app_code += "export default App;\n"

    Path("/home/claude/work/react-frontend/src/App.jsx").write_text(app_code, encoding="utf-8")
    print("Wrote App.jsx with", len(app_routes), "routes")


if __name__ == "__main__":
    main()
