import { Request, Response } from 'express';
import client from '../config/db';
import { v2 as cloudinary } from 'cloudinary';

const upadtePostController = async (req: Request, res: Response): Promise<void> => {
    client.connect();
    try {
        const { title, id } = req.body;

        // Get the file from the request
        const file: any = req.files?.post_url;


        if (!file || !file.tempFilePath) {
            res.status(400).send({ message: 'File is missing or invalid' });
        }

        console.log(file.tempFilePath);

        const existingData = await client.query("Select * from posts where id = $1",[id]);
        console.log(existingData);
        

        // Upload the file to Cloudinary using Promises
        


        // Insert the post information into the database
        await client.query('INSERT INTO posts (user_id, post_image_url, title) VALUES($1, $2, $3)', [id, file.tempFilePath, title]);

        // Send the success response
        res.status(200).send({
            success: true,
            message: 'Post Posted',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error in Post',
            error,
        });
    } finally {
        // Close the database connection
        client.end();
    }
};

const createPostController = async (req: Request, res: Response): Promise<void> => {
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    client.connect();
    try {
        const { title, id } = req.body;

        // Validation
        if (!title) {
            res.status(400).send({ message: 'Title is Required' });
        }
        if (!id) {
            res.status(400).send({ message: 'User Required, Please Login' });
        }

        // Get the file from the request
        const file: any = req.files?.post_url;


        if (!file || !file.tempFilePath) {
            res.status(400).send({ message: 'File is missing or invalid' });
        }

        console.log(file.tempFilePath);
        

        // Upload the file to Cloudinary using Promises
        


        // Insert the post information into the database
        await client.query('INSERT INTO posts (user_id, post_image_url, title) VALUES($1, $2, $3)', [id, file.tempFilePath, title]);

        // Send the success response
        res.status(200).send({
            success: true,
            message: 'Post Posted',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error in Post',
            error,
        });
    } finally {
        // Close the database connection
        client.end();
    }
};

export { createPostController, upadtePostController };
