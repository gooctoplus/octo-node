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
                    return res.status(500).send({ message: "Error in password comparison", error: err.message });
                }
                if (result) {
                    const token = getToken(org);
                    res.status(200).send({ token });
                } else {
                    res.status(401).send({ message: "Invalid credentials" });
                }
            });
        } else {
            res.status(401).send({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

export default router;