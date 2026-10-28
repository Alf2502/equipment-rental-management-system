const equipmentData = [
    {
        id: 1,
        name: "Business Laptop",
        category: "computer",
        categoryName: "Computers",
        description: "Professional laptop suitable for business, school, and office use.",
        rate: 800,
        icon: "💻",
        available: true
    },
    {
        id: 2,
        name: "DSLR Camera",
        category: "camera",
        categoryName: "Cameras",
        description: "High-quality DSLR camera suitable for photography and events.",
        rate: 1200,
        icon: "📷",
        available: true
    },
    {
        id: 3,
        name: "HD Projector",
        category: "projector",
        categoryName: "Projectors",
        description: "HD projector suitable for presentations, meetings, and events.",
        rate: 1000,
        icon: "📽️",
        available: true
    },
    {
        id: 4,
        name: "Portable Speaker",
        category: "audio",
        categoryName: "Audio Equipment",
        description: "Portable speaker system for meetings, parties, and events.",
        rate: 700,
        icon: "🔊",
        available: true
    }
];

function getAllEquipment(req, res) {
    res.status(200).json({
        success: true,
        count: equipmentData.length,
        data: equipmentData
    });
}

function getEquipmentById(req, res) {
    const equipment = equipmentData.find(
        item => item.id === Number(req.params.id)
    );

    if (!equipment) {
        return res.status(404).json({
            success: false,
            message: "Equipment not found."
        });
    }

    res.status(200).json({
        success: true,
        data: equipment
    });
}

module.exports = {
    getAllEquipment,
    getEquipmentById
};