const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "excel-mps@mps-web-509703.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1nMofzWXlzF5t\ndsD+Akh5hE5Ng12saINzbuxQSWgtrGNIoPyGj5eIyomaLueb9XVxtzKwh/5tAcGS\npPF96oI9RkizhiBtdYqHydV74NBnElETumvGujZomKvQLxrSD674sucCZSEHUwi1\nJcenIpMnOCRsfBP+F+TyudKSgT4aAdCptoQ9ozEwejKfFmt0omSgL1lC0SciPYj8\nnwY5DFI7CixuyKbQRsma6n95ESxtbX7O/gBbJPhAsHwTLF597a8gGZFICpIzkU47\ntcIJRBRMh3VfB6qU/y6+L/Bj3wjIri1HubadogLSh+hngS6FIMimY80jS7UFyx+I\n1enlxjGRAgMBAAECggEAGa9PqWkZLNjXJKVo7K5R+wL1OA0zevtaVpcCIOYLhSTI\n8y/2xukZRfqvCflG6aMGCyEdBXkWSJW4/2OzK7Bg3whI++rPket6aMiTbW5Wywen\neSIiX/wHTzUDB5xshKI8iBEf5BIoC6sjTiCbuKLb1kN1vfSxDHyV9VDGhnsfgfnc\nDggLARBFYJlNxqkoGt4G/IJnsz28grOLxXjvjvLOMIXBvbOfukseQDwScN9M4Eoh\n0ycbWwr6N84HowqyLBQEX+uuby7M5lCh0tK55TElrfj/csT+pnsbCLJziuqLsnQA\n22wNsC53muPvFraOKt7qp43pYNK3dowW08x+Q4zQ6QKBgQDeXhtqRkSqa4nhHeNi\n5w5zc7mzdFjwCzgsV7FeZN4dPLmP7KxfvAZJab1XsGOlWrISaZnClHu9MSQa5P5L\na2NJ2KwbOBqHWNGtQmfsUqO1iSJBoq2Hz3SIoznSRqPXK4Jb+dvIrB3LPORoBgVH\nEqLOdsfBW0f2hFeEsu8mdgXtJwKBgQDRFK0i4nQOzRO3fzQP01xRz2pkMPpUk3Ag\npN86WLpM/HAu0RpEmHkNJTLmbW3APUabOO8/ZGq87S6r3zbvQW8c71Y7coG54Pw0\nZ9xVd5Gm/HB8rV6ueChC+T4R9eEsNa2mfZ/PJmByLMmnhyrcfR+alu3nd+oIA3GB\nK6cIhaIOhwKBgGKTu3mQbw5RoA0RD+WfYpOh4NgCIw8/GgbmVTXwZ1r0uZppJD1I\ngEz5ODvwcSwzma956vUMmBJV/5iAnY7Xq2toR1vFslT/9evl/WYReIuYoHwSXvVO\n7W1JVu+16xoPKroVeO5sBsU7WFIZISvRwiTfGUzJZ4yMPLQSEtytA5GPAoGBAIQz\nnbIkHBxLwb7SGLo0+/fivbPyYCbgPxL1DQ0Yk1wgdlKz9vcOreQI9GFNKgtW83Es\nk+KyfOdO1abpchPgfQB/uTfHlI1S3EXKsj/8ZcV/cyTyfp607UhDzuKOZT2OB2nx\nnv3dlzg6Z5udVRWrrDMUYgNtCDbe7oMtdeVmkey7AoGAHvpmCqbmRWHi5jVxj5zb\nRO/soRbdsVFYKga/yfax8PrygUY46YaH3sA9UjSjbh7xmDesFhvJQGFvpWTGS5XF\nBUhUQcBR1luhJGma0ns6dh138YEUbImffdN/HfdXMc2KjCIHDk8tDwJswSuWlLvn\nR8nOpDsOqXhYlQZvCaolRLA=\n-----END PRIVATE KEY-----\n"
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function run() {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '17wVemsUOXN0sOAKbYC2SBjUPrjovZNDguNWI5-AsAnI',
    });
    const sheetNames = res.data.sheets.map(s => s.properties.title);
    console.log('Available sheets:', sheetNames);
  } catch (e) {
    console.error('Error fetching sheets metadata:', e.message);
  }
}
run();
