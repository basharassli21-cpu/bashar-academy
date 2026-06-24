export function generateCertificateHtml(params: {
  studentName: string;
  courseName: string;
  date: string;
  instructorName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
        .certificate {
          width: 800px; height: 600px;
          border: 12px solid #1a1a2e;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          background: #fafafa;
        }
        h1 { color: #1a1a2e; font-size: 14px; text-transform: uppercase; letter-spacing: 4px; }
        h2 { font-size: 36px; color: #1a1a2e; margin: 16px 0; }
        .student { font-size: 28px; color: #e94560; font-weight: bold; margin: 8px 0; }
        .course { font-size: 20px; color: #333; margin: 8px 0; }
        .date { font-size: 14px; color: #666; margin-top: 24px; }
        .instructor { font-size: 14px; color: #666; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <h1>شهادة إتمام</h1>
        <h2>CERTIFICATE OF COMPLETION</h2>
        <p>This certifies that</p>
        <p class="student">${params.studentName}</p>
        <p>has successfully completed the course</p>
        <p class="course">${params.courseName}</p>
        <p class="date">Date: ${params.date}</p>
        <p class="instructor">Instructor: ${params.instructorName}</p>
      </div>
    </body>
    </html>
  `;
}
