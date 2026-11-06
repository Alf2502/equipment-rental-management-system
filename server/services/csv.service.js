
const fs = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const DATA_DIR = path.join(__dirname, "../../data");

async function readCSV(filename) {
    const filePath = path.join(DATA_DIR, filename);

    try {
        const content = await fs.readFile(filePath, "utf8");

        return parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true
        });
    } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
    }
}

async function writeCSV(filename, records, columns) {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const content = stringify(records, {
        header: true,
        columns
    });

    await fs.writeFile(
        path.join(DATA_DIR, filename),
        content,
        "utf8"
    );
}

module.exports = { readCSV, writeCSV };
