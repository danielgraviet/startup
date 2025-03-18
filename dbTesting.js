const { MongoClient } = require('mongodb');
const config = require('./mongoConfig.json');

async function main() {
    const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
    const uri = `mongodb+srv://dannygraviet:${config.password}@startupcluster.s0sj6.mongodb.net/?retryWrites=true&w=majority&appName=StartupCluster`
    const client = new MongoClient(uri);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Get database and collection references
        const db = client.db('startup');
        const users = db.collection('users');

        // Test database connection
        await db.command({ ping: 1 });
        console.log('Database connection successful');

        // Test user insertion
        const testUser = {
            username: 'testuser',
            password: 'password',
            email: 'testuser@example.com',
            timestamp: new Date()
        };

        const insertResult = await users.insertOne(testUser);
        console.log('Inserted user with id:', insertResult.insertedId);

        // Test user retrieval
        const foundUser = await users.findOne({ username: 'testuser' });
        console.log('Found user:', foundUser);

        // Test user update
        const updateResult = await users.updateOne(
            { username: 'testuser' },
            { $set: { lastLogin: new Date() } }
        );
        console.log('Updated user count:', updateResult.modifiedCount);

        // Test user deletion
        const deleteResult = await users.deleteOne({ username: 'testuser' });
        console.log('Deleted user count:', deleteResult.deletedCount);

    } catch (error) {
        console.error('Database operation failed:', error);
    } finally {
        // Close the connection
        await client.close();
        console.log('Database connection closed');
    }
}

// Run the tests
main().catch(console.error);