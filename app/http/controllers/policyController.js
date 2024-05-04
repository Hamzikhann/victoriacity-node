const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Policy = require('../../models/Policy.js');
const PDFDocument = require('pdfkit');
dotenv.config();

class policyController {
// Create a new policy
static createPolicy = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const policy = await Policy.create({
      title,
      description,
      startDate,
      endDate
    });
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create policy' });
  }
};

// Retrieve all policies
static getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.findAll();
    res.status(200).json({policies:policies});
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve policies' });
  }
};

// Update a policy
static updatePolicy = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, description, startDate, endDate } = req.body;
    if(id){
    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
       const updatePolicy = Policy.update({
        title:title,
        description:description,
        startDate:startDate,
        endDate:endDate
       }, { where: { id: id } })
    await policy.save();

    return res.status(200).send({
        status: 200 ,
        "message": "policy updated successfully",
        "Policy": policy
    })
    }

    else{
        res.status(400).json({ error: 'id is required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy' });
  }
};

// Delete a policy
static deletePolicy = async (req, res) => {
  try {
    const { id } = req.query;
if(id){
    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    await policy.destroy({ where: { id: id } });

    return res.status(200).send({
        status: 200 ,
        "message": "policy delted successfully",
        "Policy": policy
    })
    }
    else{
        return res.status(400).send({
            status: 400 ,
            "message": "id Is required",
        })
    }
  } catch (error) {
    return next(error);
  }
}


static downloadPolicyPDF = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Id required' });
    }

    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Buffer to store the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {
      // Concatenate the buffer chunks into a single buffer
      const pdfBuffer = Buffer.concat(buffers);

      // Set the response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${policy.title}.pdf"`);

      // Send the PDF buffer as the response
      res.send(pdfBuffer);
    });

    // Add content to the PDF document
    doc.fontSize(20).text(policy.title);
    doc.fontSize(12).text('Description: ' + policy.description);
    doc.fontSize(12).text('Start Date: ' + policy.startDate.toDateString());
    doc.fontSize(12).text('End Date: ' + policy.endDate.toDateString());

    // End the document to trigger the 'end' event
    doc.end();

    const baseUrl = 'https://sheranwalaPdf.com'; // Replace with your actual base URL
    const pdfUrl = `${baseUrl}/pdfs/${filename}`;

    res.status(200).json({ url: pdfUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to download policy as PDF' });
  }
};

  
};
module.exports = policyController