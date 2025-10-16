const { faker } = require('@faker-js/faker');
const fs = require('fs');

function generateTasksCSV(n, filePath = 'tasks.csv') {
    const header = 'FirstName,Phone,Notes';
    const rows = [header];

    for (let i = 0; i < n; i++) {
        const firstName = faker.person.firstName();
        const phone = faker.phone.number('+91##########');
        const notes = faker.lorem.sentence();

        const escapedNotes = `"${notes.replace(/"/g, '""')}"`;
        rows.push(`${firstName},${phone},${escapedNotes}`);
    }

    const csvContent = rows.join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');

    console.log(`✅ CSV with ${n} tasks generated: ${filePath}`);
}

generateTasksCSV(25, 'src/mockdata/mock_tasks.csv');
