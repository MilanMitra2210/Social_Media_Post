import { Request, Response } from "express";
import {hashPassword, comparePassword, isValidEmail,} from "../helpers/authHelper";
import userModel from "../models/userModel";
import JWT from "jsonwebtoken";
import client from '../config/db';

const registerController = async (
  req: Request,
  res: Response
): Promise<any> => {
  client.connect();
  try {
    const { username, email, password } = req.body;

    // validation
    if (!username) {
      return res.status(400).send({ message: "Userame is Required" });
    }
    if (!email) {
      return res.status(400).send({ message: "Email is Required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is Required" });
    }
    const isEmail = await isValidEmail(email);
    if (!isEmail) {
      return res.status(400).send({ message: "Please Enter Correct Email" });
    }

    // check user
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    // existing user
    if (result.rows.length != 0) {
      return res.status(400).send({
        success: false,
        message: "Already Registered please login",
      });
    }

    // register user
    const hashedPassword = await hashPassword(password);


    try {


      // Insert data into the users table
      const result = await client.query(
          'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING user_id, created_at',
          [username, email, hashedPassword]
      );

      res.status(200).send({
        success: true,
        message: "User Successfully Registered",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
  } finally {
      client.end();
  }
    
};

// Post Login
const loginController = async (req: Request, res: Response): Promise<any> => {
  client.connect();
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //email validation
    const isEmail = await isValidEmail(email);
    if (!isEmail) {
      return res.status(400).send({ success: false, message: "Please Enter Correct Email" });
    }

    // check user
    const user = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    // existing user
    if (user.rows.length == 0) {
      return res.status(400).send({
        success: false,
        message: "User does not exist",
      });
    }

    const userPassword: string = user.rows[0].password;
    
    const match = await comparePassword(password, userPassword);
    if (!match) {
      return res.status(403).send({
        success: false,
        message: "Invalid Password",
      });
    }

    // token
    const jwt_secret_key: string = process.env.JWT_SECRET || "";
    const token = await JWT.sign({ id: user.rows[0].user_id }, jwt_secret_key, {
      expiresIn: "7d",
    });
    
    const userData: any[] = user.rows;
    res.status(200).send({
      success: true,
      message: "Login successfully",
      userData,
      token

    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login"
    });
  } finally {
    client.end(); 
  }
};

const listDataController = async (req: Request, res: Response): Promise<any> => {
  client.connect();
  try {
    // Fetch all documents from the collection
    const users =  await client.query('SELECT username FROM users');

    return res.status(200).json(users.rows)
  } catch (error) {
    return res.status(500).send({
        success: false,
        message: "Error in Fetching data",
        error,
    });
  }
};

const updateDataController= async (req: Request, res: Response): Promise<any> =>{
    const userId = req.params.id;
    const updatedUserData = req.body;
    



    //email validation
    if(updatedUserData.email){
        const isEmail = await isValidEmail(updatedUserData.email);
        if (!isEmail) {
            return res.status(400).send({ success: false, message: "Please Enter Correct Email" });
          }
    }
    
    
    if(userId.length != 24){
        return res.status(400).json({ message: 'ID is not of specified length' });
    }

    try {
        const existingUser = await userModel.findById(userId);
        

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        // Update user fields
        if(updatedUserData.password){          
          const hashedPassword = await hashPassword(updatedUserData.password);
          existingUser.password = hashedPassword;
        }
        
        existingUser.name = updatedUserData.name || existingUser.name;
        existingUser.email = updatedUserData.email || existingUser.email;
        existingUser.phone = updatedUserData.phone || existingUser.phone;
        existingUser.address = updatedUserData.address || existingUser.address;
        existingUser.gender = updatedUserData.gender || existingUser.gender;
        existingUser.hobbies = updatedUserData.hobbies || existingUser.hobbies;

        // Save updated user data
        await existingUser.save();

        return res.status(200).json({ message: 'User updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteDataController = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;

    // Validate the user ID format
    if (userId.length !== 24) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if the user exists
    const existingUser = await userModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    const deletedUser = await userModel.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { registerController, loginController , listDataController, updateDataController, deleteDataController};
