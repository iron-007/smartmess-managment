const express = require("express");
const cors = require("cors");
const ldap = require("ldapjs");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ LDAP CONFIG (based on your setup)
const LDAP_URL = "ldap://127.0.0.1:389";
const BASE_DN = "dc=smartmess,dc=local";

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // ✅ Input validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });
    }

    // ✅ Handle email OR username
    const uid = username.trim().toLowerCase();

    const client = ldap.createClient({
        url: LDAP_URL,
        reconnect: true,
        timeout: 5000,
        connectTimeout: 5000
    });

    // ✅ Correct DN format (based on your LDAP structure)
    const userDN = `uid=${uid},ou=users,${BASE_DN}`;

    console.log("🔍 Trying DN:", userDN);

    client.bind(userDN, password, (err) => {

        if (err) {
            console.log("❌ LDAP Error:", err.message);

            client.unbind();

            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        console.log("✅ LDAP Login Success:", uid);

        client.unbind();

        return res.json({
            success: true,
            message: "LDAP Login Successful",
            user: uid
        });
    });
});

// ✅ Server start
app.listen(3000, () => {
    console.log("🚀 LDAP Auth Server running at http://localhost:3000");
});