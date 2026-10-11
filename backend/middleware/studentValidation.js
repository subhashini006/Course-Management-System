const validateStudent = (req, res, next) => {
    const { username, name, email, department, password } = req.body || {};
    const fail = (message) => res.status(400).json({ success: false, message });

    if (![username, name, email, department, password].every((v) => v && String(v).trim())) {
        return fail("Please fill in all fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return fail("Please enter a valid email address.");
    }
    if (String(password).length < 6) {
        return fail("Password must be at least 6 characters.");
    }

    next();
};

module.exports = validateStudent;
