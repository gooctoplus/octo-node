import express from "express";
import Org from '../models/orgModel';
import bcrypt from 'bcrypt';
import { getToken } from "../util";

const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const org = await Org.findOne({ email });
        if (org) {
            bcrypt.compare(password, org.password, (err, result) => {
                if (err) {
                    console.error("Error in password comparison: ", err.message); // Logging the error
                    return res.status(500).send({ message: "Error in password comparison", error: err.message });
                }
                if (result) {
                    const token = getToken(org);
                    console.log("Login successful, token generated."); // Logging success
                    res.status(200).send({ token });
                } else {
                    console.log("Password does not match."); // Logging the failed attempt
                    res.status(401).send({ message: "Invalid credentials" });
                }
            });
        } else {
            console.log("Org not found for the provided email."); // Logging the failed attempt
            res.status(401).send({ message: "Org not found" });
        }
    } catch (error) {
        console.error("Login error: ", error); // Logging the full error
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

export default router;