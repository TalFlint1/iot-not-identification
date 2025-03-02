require('dotenv').config();  // This will load your .env file

const AWS = require('aws-sdk');

// Set region and credentials
AWS.config.update({
  region: 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB();

// Update the table to add a new attribute
const params = {
  TableName: 'Users',
  AttributeDefinitions: [
    {
      AttributeName: 'email',  // New attribute you want to add
      AttributeType: 'S'
    }
  ],
  GlobalSecondaryIndexUpdates: []  // No changes to indexes
};

dynamoDB.updateTable(params, function(err, data) {
  if (err) {
    console.log('Error updating table:', err);
  } else {
    console.log('Table updated successfully:', data);
  }
});
