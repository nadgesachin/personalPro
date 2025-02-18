import { Request, Response } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';

export const createUser = async (req: Request, res: Response) => {
    const { phone, name, email, gender, profileImage, profileCompleted } = req.body;

    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    const updatedData = {
        phone,
        name,
        email,
        gender,
        profileImage,
        profileCompleted
    }

    try {
        const existingUser = await User.findOneAndUpdate({ email }, updatedData, { new: true, upsert: true });
        // Create notification for profile update
        await Notification.create({
            userId: existingUser._id,
            message: 'Your profile has been updated successfully',
            type: 'success',
            name:existingUser.name,
            date: new Date()
        });
        return res.status(201).json({ success: true, message: 'User created successfully', user: existingUser });
    } catch (error) {
        console.log("Error user createion: ",error);
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { phone, name, email, gender, profileImage, profileCompleted } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = name;
        user.email = email;
        user.gender = gender;
        user.profileImage = profileImage;
        user.profileCompleted = profileCompleted;

        await user.save();

        // Create notification for profile update
        await Notification.create({
            userId: user._id,
            message: 'Your profile has been updated successfully',
            type: 'success'
        });

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                phone: user.phone,
                name: user.name,
                email: user.email,
                gender: user.gender,
                profileImage: user.profileImage,
                profileCompleted: user.profileCompleted
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};