import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QA API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
          }
          .container {
            text-align: center;
            background-color: #fff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 5px;
          }
          .version {
            font-weight: bold;
            color: #555;
          }
          footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #aaa;
          }
          .logo {
            width: 100px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://cgspace.cgiar.org/server/api/core/bitstreams/4ed310df-d091-47a9-b86a-10dc3eb141af/content" alt="CGIAR Logo" class="logo">
          <h1>QA API</h1>
          <p>Quality Assessment API for CGIAR</p>
          <p class="version">Version: 2.0</p>
          <footer>
            &copy; 2024 CGIAR. All rights reserved.
          </footer>
        </div>
      </body>
      </html>
    `;
  }
}
