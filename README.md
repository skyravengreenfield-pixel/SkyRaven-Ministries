# SkyRaven Ministries Mobile App

A React Native mobile application for SkyRaven Ministries that enables users to make donations and track ministry expenses.

## Features

### 🎁 Donations
- Quick donation amounts for easy giving
- Custom donation amount input
- Donor information collection
- Optional message support
- Secure donation processing (ready for payment integration)

### 💰 Expense Tracking
- Add and categorize expenses
- View expense history
- Track total spending
- Multiple expense categories:
  - Ministry Operations
  - Outreach Programs
  - Facilities
  - Staff
  - Events
  - Supplies
  - Technology
  - Other

### 🏠 Home Dashboard
- Ministry mission and information
- Quick access to features
- Impact statistics
- Community highlights

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Icons**: Expo Vector Icons
- **Platform**: iOS, Android, and Web support

## Prerequisites

Before running the app, make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries.git
cd SkyRaven-Ministries
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:
```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Testing on a physical device:
1. Install the Expo Go app from App Store or Google Play
2. Scan the QR code displayed in the terminal with your device
3. The app will load on your device

## Project Structure

```
SkyRaven-Ministries/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Home dashboard
│   │   ├── DonateScreen.tsx     # Donation interface
│   │   └── ExpensesScreen.tsx   # Expense tracking
│   ├── constants/
│   │   └── theme.ts             # App theme and styling constants
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── App.tsx                       # Main app component with navigation
├── package.json                  # Dependencies and scripts
├── app.json                      # Expo configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                     # This file
```

## Key Components

### Home Screen
- Welcome message and ministry overview
- Feature cards for quick navigation
- Impact statistics display
- Mission statement

### Donate Screen
- Quick donation amount buttons
- Custom amount input
- Donor information form
- Secure submission (ready for payment gateway)

### Expenses Screen
- Expense list with categories
- Add new expense modal
- Category-based organization
- Total expense tracking
- Delete expense functionality

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] User authentication and profiles
- [ ] Push notifications for events
- [ ] Cloud database integration (Firebase/Supabase)
- [ ] Receipt generation for donations
- [ ] Expense reports and analytics
- [ ] Event calendar
- [ ] Volunteer management
- [ ] Prayer request feature
- [ ] Social sharing capabilities

## Customization

### Colors and Theme
Edit colors in [src/constants/theme.ts](src/constants/theme.ts) to match your ministry's branding.

### Categories
Modify expense categories in [src/screens/ExpensesScreen.tsx](src/screens/ExpensesScreen.tsx).

### Content
Update ministry information in [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx).

## Payment Integration

To enable actual payment processing:

1. Sign up for a payment provider (e.g., Stripe)
2. Install the SDK: `npm install @stripe/stripe-react-native`
3. Configure your API keys in a `.env` file
4. Update the donation submission logic in DonateScreen.tsx

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is created for SkyRaven Ministries.

## Support

For questions or support, please contact SkyRaven Ministries.

---

Built with ❤️ for SkyRaven Ministries