# 🎓 Exams Application

A modern, secure, and feature-rich examination management system built with React, TypeScript, and Vite. This application provides a comprehensive platform for conducting online exams with advanced security features and browser restrictions.

## 🌐 Live Demo

**🔗 [View Live Application](https://frontend-demo.mrcgpintsouthasia.net/)**

## ✨ Features

### 🔐 Security & Authentication
- **Secure Login System** with Redux state management
- **Custom Toast Notifications** for login feedback
- **Protected Routes** for authenticated users
- **Browser Compatibility Checks** with Chrome-only restrictions
- **Latest Chrome Version Requirements** (latest 3 versions only)

### 📝 Exam Management
- **Interactive Dashboard** with real-time statistics
- **Application Form System** for exam registration
- **Exam Component** with secure exam environment
- **Application Status Tracking** with visual indicators
- **PDF Generation** for exam results and applications

### 🎨 User Interface
- **Modern Design** with Tailwind CSS
- **Dark/Light Theme** support
- **Responsive Design** for all devices
- **Professional UI Components** using Radix UI
- **Smooth Animations** and transitions

### 🔧 Technical Features
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Form Validation** with React Hook Form and Zod
- **Automatic Data Formatting** for names and addresses
- **File Upload** and preview functionality
- **Data Tables** with sorting and filtering

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser (latest 3 versions)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Exams-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in Chrome**
   - Navigate to `http://localhost:5173`
   - **Important**: Use only Google Chrome browser

## 🏗️ Project Structure

```
Exams-Application/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── LoginForm.tsx   # Authentication form
│   │   ├── examComponent.tsx # Exam interface
│   │   └── application-form.tsx # Application form
│   ├── auth/               # Authentication logic
│   ├── redux/              # State management
│   ├── lib/                # Utilities and helpers
│   │   ├── browserDetection.ts # Browser compatibility
│   │   ├── chromeVersionUpdater.ts # Version management
│   │   └── utils.ts # Data formatting utilities
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔒 Browser Requirements

### Supported Browsers
- **Google Chrome Only** (latest 3 versions)
- Currently supported versions: `131`, `130`, `129`

### Why Chrome Only?
- **Security**: Ensures consistent security features
- **Compatibility**: Eliminates browser-specific issues
- **Anti-cheating**: Prevents browser manipulation
- **Performance**: Optimized for Chrome's rendering engine

### Browser Detection
The application automatically detects and validates:
- Browser type (Chrome vs others)
- Chrome version compatibility
- Displays user-friendly error messages for unsupported browsers

## 🎯 Usage Guide

### Login
1. Navigate to the login page
2. Use credentials: `admin` / `admin` (demo)
3. Toast notifications will guide you through any errors

### Dashboard
- View exam statistics and applications
- Navigate to different sections
- Monitor application status

### Applications
- Submit new exam applications
- Track application status
- View application history

### Exams
- Take secure online exams
- Real-time progress tracking
- Automatic submission

## 📝 Data Formatting

The application automatically formats user input data to ensure consistency and proper presentation:

### Name Formatting
- **Input**: Users can type names in any format (uppercase, lowercase, mixed case, extra spaces)
- **Output**: Automatically converted to proper case (first letter of each word capitalized)
- **Example**: `"MUHAMMAD RAJAB RAZA"` → `"Muhammad Rajab Raza"`

### Address Formatting
- **Input**: Address fields can be entered in any format
- **Output**: First word capitalized, rest in lowercase
- **Example**: `"123 MAIN STREET"` → `"123 main street"`

### Fields That Get Formatted
- **Names**: `fullName`
- **Addresses**: `poBox`, `district`, `city`, `province`, `country`
- **School Information**: `schoolName`, `schoolLocation`
- **Countries**: `countryOfExperience`, `countryOfOrigin`
- **Authority**: `registrationAuthority`

### How It Works
1. **User Input**: Users type data in any format
2. **Automatic Formatting**: Data is formatted during form validation using Zod transforms
3. **API Upload**: Formatted data is sent to the API in the correct format
4. **Consistent Output**: All data is stored and displayed consistently

### Benefits
- **Consistency**: All data follows the same formatting rules
- **User-Friendly**: Users don't need to worry about formatting
- **Data Quality**: Ensures clean, properly formatted data in the database
- **Professional Appearance**: Consistent formatting in reports and displays

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Browser compatibility
npm run test:browser # Test browser detection
```

### Environment Setup

1. **Development Environment**
   ```bash
   npm run dev
   ```

2. **Production Build**
   ```bash
   npm run build
   ```

3. **Preview Build**
   ```bash
   npm run preview
   ```

## 🚀 Deployment

### Vercel Deployment
The application is configured for Vercel deployment with:
- Automatic builds from main branch
- SPA routing configuration
- Environment variable support

### Deployment Steps
1. **Connect to Vercel**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Set production API endpoints
   - Configure authentication settings

3. **Deploy**
   ```bash
   git push origin main
   ```

### Live Deployment
- **URL**: [https://frontend-demo.mrcgpintsouthasia.net/](https://frontend-demo.mrcgpintsouthasia.net/)
- **Status**: ✅ Active
- **Last Updated**: January 2024

## 🔧 Configuration

### Chrome Version Updates
To update supported Chrome versions:

1. Edit `src/lib/chromeVersionUpdater.ts`
2. Update the `latestVersions` array
3. Update the `lastUpdated` date
4. Test with different Chrome versions

### Authentication
Configure authentication in:
- `src/redux/Slice.ts` - Redux state management
- `src/auth/` - Authentication components
- `src/components/LoginForm.tsx` - Login interface

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Top navigation bar

## 🎨 Theming

### Theme Support
- **Light Theme**: Default professional appearance
- **Dark Theme**: Dark mode for reduced eye strain
- **Auto-switching**: Based on system preferences

### Customization
Themes can be customized in:
- `src/components/theme-provider.tsx`
- `tailwind.config.js`
- CSS variables in `src/globals.css`

## 🔍 Testing

### Browser Compatibility Testing
```bash
# Test different Chrome versions
npm run test:browser

# Test browser restrictions
npm run test:restrictions
```

### Manual Testing Scenarios
1. **Login with wrong credentials**
2. **Access with unsupported browsers**
3. **Test responsive design**
4. **Verify theme switching**

## 📚 Documentation

### Additional Documentation
- [Chrome Version Maintenance Guide](./CHROME_VERSION_MAINTENANCE.md)
- [Toast Notification Demo Guide](./TOAST_DEMO.md)

### API Documentation
- Authentication endpoints
- Exam data structure
- Application form schema

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript best practices
2. **Components**: Use functional components with hooks
3. **State**: Use Redux for global state management
4. **Styling**: Use Tailwind CSS classes
5. **Testing**: Test browser compatibility

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: Application doesn't load in my browser**
A: Ensure you're using Google Chrome (latest 3 versions). Other browsers are not supported.

**Q: Login fails with correct credentials**
A: Check browser console for errors. Ensure you're using the demo credentials: `admin` / `admin`

**Q: Application looks broken on mobile**
A: The application is responsive. Try refreshing the page or clearing browser cache.

**Q: Do I need to format my name and address data?**
A: No! The application automatically formats names and addresses. You can type in any format (uppercase, lowercase, mixed case) and it will be properly formatted when submitted.

### Getting Help
- Check the [documentation](./docs/)
- Review [browser requirements](#browser-requirements)
- Test with [demo credentials](#usage-guide)

## 🔄 Updates

### Recent Updates
- ✅ Added browser compatibility restrictions
- ✅ Implemented toast notifications for login
- ✅ Enhanced security with Chrome-only access
- ✅ Improved responsive design
- ✅ Added comprehensive documentation
- ✅ Implemented automatic data formatting for names and addresses
- ✅ Enhanced form validation with Zod transforms

### Upcoming Features
- 🔄 Multi-language support
- 🔄 Advanced exam analytics
- 🔄 Real-time collaboration
- 🔄 Mobile app version

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

**Live Demo**: [https://frontend-demo.mrcgpintsouthasia.net/](https://frontend-demo.mrcgpintsouthasia.net/)# mrcgp-frontend
