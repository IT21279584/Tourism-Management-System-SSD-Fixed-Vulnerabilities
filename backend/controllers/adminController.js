const asyncHandler = require("express-async-handler");
const Admin = require("../models/adminModel");
const generateToken = require("../utils/generateToken");
const sanitize = require('mongo-sanitize');
const bcrypt = require("bcryptjs");

// register user as a admin
const registerAdmin = asyncHandler(async (req, res) => {
	const { name, telephone, address, email, password, pic } = req.body;

	const adminExists = await Admin.findOne({ email });
	if (adminExists) {
		res.status(400);
		throw new Error("Admin Profile Exists !");
	}

	const admin = new Admin({
		name,
		telephone,
		address,
		email,
		password,
		pic,
	});

// 	const addedAdmin =await admin.save();

// 	if (admin) {
// 		res.status(201).json(addedAdmin);
// 	} else {
// 		res.status(400);
// 		throw new Error("Admin Registration Failed !");
// 	}
// });

const salt = await bcrypt.genSalt(10);

	admin.password = await bcrypt.hash(password, salt);

	await admin.save();

	if (admin) {
		res.status(201).json({
			_id: admin._id,
			name: admin.name,
			isAdmin: admin.isAdmin,
			telephone: admin.telephone,
			address: admin.address,
			email: admin.email,
			pic: admin.pic,
			token: generateToken(admin._id),
		});
	} else {
		res.status(400);
		throw new Error("Admin Registration Failed !");
	}
});

// authenticate the admin

const authAdmin = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
 
	// Sanitize the email input to prevent NoSQL injection
	const sanitizedEmail = sanitize(email);
 
	// Validate that email is a valid string (you can add more validation)
	if (typeof sanitizedEmail !== "string" || !sanitizedEmail) {
		res.status(400);
		throw new Error("Invalid Email");
	}
 
	try {
		const admin = await Admin.findOne({ email: sanitizedEmail }).exec();
 
		if (!admin) {
			res.status(400);
			throw new Error("Invalid Email or Password");
		}
 
		// Compare the hashed password in the request body with the hashed password in the database
		const isMatch = await bcrypt.compare(password, admin.password);
 
		if (isMatch) {
			res.status(201).json({
				_id: admin._id,
				name: admin.name,
				telephone: admin.telephone,
				address: admin.address,
				email: admin.email,
				password: admin.password,
				pic: admin.pic,
				token: generateToken(admin._id),
			});
		} else {
			res.status(400);
			throw new Error("Invalid Email or Password");
		}
	} catch (error) {
		// Handle any other errors
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// const authAdmin = asyncHandler(async (req, res) => {
// 	const { email, password } = req.body;

// 	const admin = await Admin.findOne({ email });

// 	if (!admin) {
// 		res.status(400);
// 		throw new Error("Invalid NIC or Password");
// 	}

// 	if (!(password === admin.password)) {
// 		res.status(400);
// 		throw new Error("Invalid Email or Password");
// 	} else {
// 		res.status(201).json({
// 			_id: admin._id,
// 			name: admin.name,
// 			telephone: admin.telephone,
// 			address: admin.address,
// 			email: admin.email,
// 			password: admin.password,
// 			pic: admin.pic,
// 		});
// 	}
// });

// view admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
	const admin = await Admin.findById(req.admin._id);

	if (admin) {
		res.status(201).json(admin);
	} else {
		res.status(400);
		throw new Error("Admin Not Found !");
	}
});

// update admin profile
const updateAdminProfile = asyncHandler(async (req, res) => {
	const admin = await Admin.findById(req.admin._id);

	if (admin) {
		admin.name = req.body.name || admin.name;
		admin.telephone = req.body.telephone || admin.telephone;
		admin.address = req.body.address || admin.address;
		admin.email = req.body.email || admin.email;
		admin.pic = req.body.pic || admin.pic;
		admin.password = req.body.password || admin.password;
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			admin.password = await bcrypt.hash(req.body.password, salt);
		}
		const updatedAdmin = await admin.save();

		res.json({
			_id: updatedAdmin._id,
			name: updatedAdmin.name,
			isAdmin: updatedAdmin.isAdmin,
			telephone: updatedAdmin.telephone,
			address: updatedAdmin.address,
			email: updatedAdmin.email,
			pic: updatedAdmin.pic,
		});
	} else {
		res.status(404);
		throw new Error("Admin Not Found !");
	}
});

module.exports = { registerAdmin, authAdmin, getAdminProfile, updateAdminProfile };
