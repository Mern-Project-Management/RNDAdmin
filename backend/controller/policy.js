const Policy = require('../model/policy');

// Create policy
exports.createPolicy = async (req, res) => {
  try {
    const { policyType, title = '', content, isActive = true } = req.body;

    const policy = new Policy({
      policyType,
      title,
      content,
      isActive,
    });

    const saved = await policy.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all policies (optional filter by policyType)
exports.getAllPolicies = async (req, res) => {
  try {
    const { policyType } = req.query;
    const filter = {};
    if (policyType) filter.policyType = policyType;

    const policies = await Policy.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(policies);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get policy by ID
exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.query;
    const policy = await Policy.findById(id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json(policy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update policy
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.query;
    const updateData = { ...req.body };

    const updated = await Policy.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Policy not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.query;
    const deleted = await Policy.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

