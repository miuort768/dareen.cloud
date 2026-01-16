const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/students', // The students endpoint calls getStudentEnrollments
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const students = JSON.parse(data);
            // Ensure we got an array directly or inside a data property
            const studentList = Array.isArray(students) ? students : (students.data || []);

            const ahmed = studentList.find(s => s.name.includes('احمد عبدالله'));

            if (ahmed) {
                console.log('Found Student:', ahmed.name);
                const afkarEnrollment = ahmed.enrollments.find(e => e.teacher.includes('افكار'));

                if (afkarEnrollment) {
                    console.log('Enrollment with Afkar found:');
                    console.log(`- Subject: ${afkarEnrollment.subject}`);
                    console.log(`- Sessions Used (API Response): ${afkarEnrollment.sessionsUsed}`);
                    console.log(`- Sessions Total: ${afkarEnrollment.sessionsTotal}`);
                } else {
                    console.log('No enrollment with teacher "Afkar" found for this student.');
                    console.log('All enrollments:', ahmed.enrollments);
                }
            } else {
                console.log('Student "Ahmed Abdullah" not found in API response.');
            }
        } catch (e) {
            console.error('Error parsing response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
