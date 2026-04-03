const MenuListing = require('../model/menuListing');
const fs = require('fs');
const path = require('path');

// Create a new menu listing
exports.createMenuListing = async (req, res) => {
    try {
        const parseIfString = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            return val;
        };

        let { parent = {}, children = [] } = req.body;
        parent = parseIfString(parent);
        children = parseIfString(children) || [];

        // Map uploaded files to the corresponding parent/children/subChildren entries
        if (req.files) {
            // Parent photo (field name: 'photo')
            if (req.files['photo'] && req.files['photo'][0]) {
                parent.photo = 'uploads/images/' + req.files['photo'][0].filename;
            }

            // Dynamic child/subChild photo fields may be named in different patterns.
            Object.keys(req.files).forEach(fieldName => {
                // children[0][photo]
                const childPhotoMatch = fieldName.match(/^children\[(\d+)\]\[photo\]$/);
                if (childPhotoMatch) {
                    const idx = Number(childPhotoMatch[1]);
                    if (children[idx]) children[idx].photo = 'uploads/images/' + req.files[fieldName][0].filename;
                    return;
                }

                // children[0][subChildren][1][photo]
                const subChildMatch = fieldName.match(/^children\[(\d+)\]\[subChildren\]\[(\d+)\]\[photo\]$/);
                if (subChildMatch) {
                    const pIdx = Number(subChildMatch[1]);
                    const sIdx = Number(subChildMatch[2]);
                    if (children[pIdx] && Array.isArray(children[pIdx].subChildren)) {
                        if (children[pIdx].subChildren[sIdx]) {
                            children[pIdx].subChildren[sIdx].photo = 'uploads/images/' + req.files[fieldName][0].filename;
                        }
                    }
                    return;
                }

                // cards[0][photo] -> treat as children index
                const cardsMatch = fieldName.match(/^cards\[(\d+)\]\[photo\]$/);
                if (cardsMatch) {
                    const idx = Number(cardsMatch[1]);
                    if (children[idx]) children[idx].photo = 'uploads/images/' + req.files[fieldName][0].filename;
                    return;
                }
            });
        }

        const newMenuListing = new MenuListing({ parent, children });
        await newMenuListing.save();

        res.status(201).json({ success: true, data: newMenuListing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all menu listings
exports.getAllMenuListings = async (req, res) => {
    try {
        const menuListings = await MenuListing.find();
        res.status(200).json({ success: true, data: menuListings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single menu listing by ID
exports.getMenuListingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Search for the menu listing where the _id matches the requested id
        let menuListing = await MenuListing.findById(id);
        if (menuListing) {
            return res.status(200).json({ success: true, data: menuListing });
        }

        // Search for the child or subchild inside all menu listings
        menuListing = await MenuListing.findOne({
            $or: [
                { "children._id": id },  // Search in children array
                { "children.subChildren._id": id }  // Search in subChildren array
            ]
        });

        if (!menuListing) {
            return res.status(404).json({ success: false, message: "Menu listing not found" });
        }

        // Find the specific child or subchild within the menu listing
        let foundItem = null;
        menuListing.children.forEach((child) => {
            if (child._id.toString() === id) {
                foundItem = child;
            }
            child.subChildren.forEach((subChild) => {
                if (subChild._id.toString() === id) {
                    foundItem = subChild;
                }
            });
        });

        if (!foundItem) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        res.status(200).json({ success: true, data: foundItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Update a menu listing by ID
exports.updateMenuListing = async (req, res) => {
    try {
        const parseIfString = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            return val;
        };

        let { parent, children } = req.body;
        parent = parseIfString(parent) || {};
        children = parseIfString(children) || [];

        if (req.files) {
            if (req.files['photo'] && req.files['photo'][0]) {
                parent.photo = 'uploads/images/' + req.files['photo'][0].filename;
            }

            Object.keys(req.files).forEach(fieldName => {
                const childPhotoMatch = fieldName.match(/^children\[(\d+)\]\[photo\]$/);
                if (childPhotoMatch) {
                    const idx = Number(childPhotoMatch[1]);
                    if (children[idx]) children[idx].photo = 'uploads/images/' + req.files[fieldName][0].filename;
                    return;
                }

                const subChildMatch = fieldName.match(/^children\[(\d+)\]\[subChildren\]\[(\d+)\]\[photo\]$/);
                if (subChildMatch) {
                    const pIdx = Number(subChildMatch[1]);
                    const sIdx = Number(subChildMatch[2]);
                    if (children[pIdx] && Array.isArray(children[pIdx].subChildren)) {
                        if (children[pIdx].subChildren[sIdx]) {
                            children[pIdx].subChildren[sIdx].photo = 'uploads/images/' + req.files[fieldName][0].filename;
                        }
                    }
                    return;
                }

                const cardsMatch = fieldName.match(/^cards\[(\d+)\]\[photo\]$/);
                if (cardsMatch) {
                    const idx = Number(cardsMatch[1]);
                    if (children[idx]) children[idx].photo = req.files[fieldName][0].filename;
                    return;
                }
            });
        }

        const updatedMenuListing = await MenuListing.findByIdAndUpdate(
            req.params.id,
            { parent, children },
            { new: true, runValidators: true }
        );

        if (!updatedMenuListing) {
            return res.status(404).json({ success: false, message: "Menu listing not found" });
        }

        res.status(200).json({ success: true, data: updatedMenuListing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a menu listing by ID
exports.deleteMenuListing = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the document exists
        const menu = await MenuListing.findOne({
            $or: [
                { _id: id }, // Check if it's a parent
                { "children._id": id }, // Check if it's a child
                { "children.subChildren._id": id }, // Check if it's a sub-child
            ],
        });

        if (!menu) {
            return res.status(404).json({ success: false, message: "Menu listing not found" });
        }

        // Delete physical photo if it exists for the deleted parent/item
        const deleteItemPhoto = (item) => {
            if (item && item.photo) {
                const fullPath = path.join(__dirname, '..', item.photo);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }
        };

        // If the ID matches the parent, delete the entire menu and its files
        if (menu._id.toString() === id) {
            if (menu.parent) deleteItemPhoto(menu.parent);
            // Also delete photos of all children and subchildren
            menu.children.forEach(child => {
                deleteItemPhoto(child);
                child.subChildren.forEach(sub => deleteItemPhoto(sub));
            });
            await MenuListing.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: "Parent menu deleted successfully" });
        }

        // If the ID matches a child or sub-child, find it, delete its photo, then remove from array
        menu.children = menu.children.filter(child => {
            if (child._id.toString() === id) {
                deleteItemPhoto(child);
                child.subChildren.forEach(sub => deleteItemPhoto(sub));
                return false;
            }
            child.subChildren = child.subChildren.filter(subChild => {
                if (subChild._id.toString() === id) {
                    deleteItemPhoto(subChild);
                    return false;
                }
                return true;
            });
            return true;
        });

        // Save the updated menu
        await menu.save();

        res.status(200).json({ success: true, message: "Menu item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};