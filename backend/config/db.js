const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(
			"mongodb+srv://HansakaJS:hansaka123@cluster0.cbz0c3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
			{
				useUnifiedTopology: true,
				useNewUrlParser: true,
			}
		);

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit();
	}
};

module.exports = connectDB;
