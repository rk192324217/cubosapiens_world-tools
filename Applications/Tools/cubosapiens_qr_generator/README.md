# GenQR

GenQR is a modern QR code generation web application designed for speed, clarity, and customization. It enables users to generate QR codes instantly, apply visual customizations, and export them efficiently through a clean and responsive interface.

---

## Features

- Instant QR code generation from any URL
- Customization options
  - Adjustable size
  - Background color selection
  - Error correction levels (L, M, Q, H)
- Center logo embedding
  - Upload custom logo
  - Reset functionality
- Download QR codes
- Copy QR code functionality
- Light and dark mode support
- Quick link presets for testing

---

## How It Works

The application uses a client side QR code generation library to dynamically render QR codes in the browser.

Workflow:

1. User inputs a URL  
2. QR code is generated instantly  
3. Customization settings are applied  
4. Optional logo is placed at the center  
5. User can download or copy the QR code  

---

## Project Structure

GenQR/
│
├── index.html     Main UI structure  
├── style.css      Styling and layout  
├── app.js         Application logic  
├── assets/  
│   └── logo.png   Application logo  

---

## User Interface Design

- Glass style header with blur effects  
- Subtle animated background elements  
- Responsive grid layout  
- Smooth transitions and micro interactions  
- Typography using DM Sans  

The styling system is built using CSS variables to support easy theming and scalability.

---

## Getting Started

### Clone the repository

git clone https://github.com/your-username/genqr.git  
cd genqr  

### Run the application

Open index.html in any modern browser.

No build tools or installation steps are required.

---

## Technology Stack

- HTML5  
- CSS3  
- JavaScript  
- QRCode generation library via CDN  

---

## Use Cases

- Sharing URLs efficiently  
- Creating QR codes for presentations or documents  
- Branding QR codes with custom logos  
- Testing QR based workflows  

---

## Future Enhancements

- SVG export support  
- Foreground color customization  
- Advanced QR styling options  
- History of generated QR codes  
- Backend API integration  

---

## Contributing

Contributions are welcome. Fork the repository and submit a pull request with improvements or new features.

---

## License

This project is available under the MIT License.

---

## Summary

GenQR focuses on delivering a minimal, efficient, and professional QR code generation experience. It is designed for users who require speed, customization, and a clean interface without unnecessary complexity.
