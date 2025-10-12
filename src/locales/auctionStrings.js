// Auction Module Localization Strings
// Supports English, Hindi, and Marathi

export const auctionStrings = {
  // English (en)
  en: {
    // Navigation
    auctions: 'Auctions',
    availableAuctions: 'Available Auctions',
    myAuctions: 'My Auctions',

    // Common Actions
    addAuctionProperty: 'Add Auction Property',
    editAuction: 'Edit Auction',
    deleteAuction: 'Delete Auction',
    viewDetails: 'View Details',
    saveAuction: 'Save Auction',
    updateAuction: 'Update Auction',
    cancel: 'Cancel',
    close: 'Close',

    // Form Labels
    auctionType: 'Auction Type',
    city: 'City',
    bankAgency: 'Bank/Agency',
    propertyType: 'Property Type',
    address: 'Address/Area',
    possession: 'Possession Status',
    propertyDescription: 'Property Description',
    reservePrice: 'Reserve Price (₹)',
    emdAmount: 'EMD Amount (₹)',
    bidIncrement: 'Bid Increment (₹)',
    auctionDate: 'Auction Date',
    inspectionDate: 'Inspection Date',
    emdSubmissionDate: 'EMD Submission Date',
    auctionVenue: 'Auction Venue',
    contact: 'Contact',
    cersaiId: 'CERSAI ID',
    auctionAct: 'Auction Act',
    paperNotice: 'Paper Notice Available',

    // Property Boundaries
    propertyBoundaries: 'Property Boundaries',
    east: 'East',
    west: 'West',
    north: 'North',
    south: 'South',

    // Registration Details
    auctionRegistrationDetails: 'Auction Registration Details',
    name: 'Name',
    state: 'State',
    zone: 'Zone',
    email: 'Email ID',
    registrationAddress: 'Address',

    // Property Types
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    agricultural: 'Agricultural',
    plot: 'Plot',
    land: 'Land',

    // Possession Status
    vacant: 'Vacant',
    occupied: 'Occupied',
    underConstruction: 'Under Construction',

    // Auction Types
    physical: 'Physical',
    symbolic: 'Symbolic',
    upcoming: 'Upcoming',

    // Auction Acts
    sarfaesiAct: 'SARFAESI Act',
    drtAct: 'DRT Act',
    other: 'Other',

    // Zones
    north: 'North',
    south: 'South',
    east: 'East',
    west: 'West',
    central: 'Central',

    // Messages
    noAuctionsAvailable: 'No auctions available',
    noAuctionsMatchFilters: 'No auctions match your current filters.',
    noPastAuctions: 'No past auctions',
    loadingAuctions: 'Loading auctions...',
    failedToLoadAuctions: 'Failed to load auctions. Please try again.',
    auctionSavedSuccessfully: 'Auction saved successfully',
    auctionUpdatedSuccessfully: 'Auction updated successfully',
    auctionDeletedSuccessfully: 'Auction deleted successfully',

    // Validation Messages
    auctionTypeRequired: 'Auction type is required',
    cityRequired: 'City is required',
    bankAgencyRequired: 'Bank/Agency is required',
    propertyTypeRequired: 'Property type is required',
    addressRequired: 'Address is required',
    descriptionRequired: 'Description is required',
    possessionRequired: 'Possession status is required',
    reservePriceRequired: 'Reserve price is required',
    emdAmountRequired: 'EMD amount is required',
    bidIncrementRequired: 'Bid increment is required',
    auctionDateRequired: 'Auction date is required',
    inspectionDateRequired: 'Inspection date is required',
    emdSubmissionDateRequired: 'EMD submission date is required',
    locationRequired: 'Auction location is required',
    contactRequired: 'Contact is required',
    reservePriceInvalid: 'Reserve price must be a valid number',
    emdAmountInvalid: 'EMD amount must be a valid number',
    bidIncrementInvalid: 'Bid increment must be a valid number',
    auctionDateFuture: 'Auction date must be in the future',
    inspectionBeforeAuction: 'Inspection date must be before auction date',
    emdBeforeAuction: 'EMD submission date must be before auction date',

    // Stats
    active: 'Active',
    myAuctions: 'My Auctions',
    upcoming: 'Upcoming',
    past: 'Past',

    // Confirmation Messages
    confirmDelete: 'Confirm Delete',
    deleteAuctionConfirmation: 'Are you sure you want to delete this auction? This action cannot be undone.',
    deleteAuction: 'Delete Auction',
    changingAuctionDate: 'Changing Auction Date will move this auction to Available tab. Continue?',

    // Placeholders
    selectCity: 'Select City',
    selectState: 'Select State',
    selectZone: 'Select Zone',
    enterBankAgency: 'Enter bank or agency name',
    enterPropertyAddress: 'Enter property address',
    enterPropertyDescription: 'Detailed description of the property',
    enterAuctionVenue: 'Venue or link for auction',
    enterContact: 'Contact person or phone',
    enterCersaiId: 'Optional CERSAI ID',
    enterRegistrantName: 'Registrant name',
    enterEmail: 'Email address',
    enterContactNumber: 'Contact number',
    enterRegistrationAddress: 'Registration address',

    // Filter Labels
    allCities: 'All Cities',
    allPropertyTypes: 'All Property Types',
    searchByBankAgency: 'Search by Bank/Agency',
    clearFilters: 'Clear Filters',

    // Empty States
    noAuctionsYet: 'You haven\'t created any auction properties yet, or all your auctions are still active.',
    noActiveAuctions: 'There are no active auction properties at the moment.',

    // Error Messages
    errorAddingAuction: 'Error adding auction. Please try again.',
    errorUpdatingAuction: 'Error updating auction. Please try again.',
    errorDeletingAuction: 'Error deleting auction. Please try again.',
    errorLoadingAuctions: 'Error loading auctions. Please try again.',
    onlyAdminCanAdd: 'Only Admin and SuperAdmin can add auctions',
  },

  // Hindi (hi)
  hi: {
    // Navigation
    auctions: 'नीलामी',
    availableAuctions: 'उपलब्ध नीलामियां',
    myAuctions: 'मेरी नीलामियां',

    // Common Actions
    addAuctionProperty: 'नीलामी संपत्ति जोड़ें',
    editAuction: 'नीलामी संपादित करें',
    deleteAuction: 'नीलामी हटाएं',
    viewDetails: 'विवरण देखें',
    saveAuction: 'नीलामी सहेजें',
    updateAuction: 'नीलामी अपडेट करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',

    // Form Labels
    auctionType: 'नीलामी प्रकार',
    city: 'शहर',
    bankAgency: 'बैंक/एजेंसी',
    propertyType: 'संपत्ति प्रकार',
    address: 'पता/क्षेत्र',
    possession: 'कब्जा स्थिति',
    propertyDescription: 'संपत्ति विवरण',
    reservePrice: 'आरक्षित मूल्य (₹)',
    emdAmount: 'ईएमडी राशि (₹)',
    bidIncrement: 'बोली वृद्धि (₹)',
    auctionDate: 'नीलामी तिथि',
    inspectionDate: 'निरीक्षण तिथि',
    emdSubmissionDate: 'ईएमडी जमा तिथि',
    auctionVenue: 'नीलामी स्थान',
    contact: 'संपर्क',
    cersaiId: 'सीईआरएसएआई आईडी',
    auctionAct: 'नीलामी अधिनियम',
    paperNotice: 'कागज नोटिस उपलब्ध',

    // Property Boundaries
    propertyBoundaries: 'संपत्ति सीमाएं',
    east: 'पूर्व',
    west: 'पश्चिम',
    north: 'उत्तर',
    south: 'दक्षिण',

    // Registration Details
    auctionRegistrationDetails: 'नीलामी पंजीकरण विवरण',
    name: 'नाम',
    state: 'राज्य',
    zone: 'क्षेत्र',
    email: 'ईमेल आईडी',
    registrationAddress: 'पता',

    // Property Types
    residential: 'आवासीय',
    commercial: 'व्यावसायिक',
    industrial: 'औद्योगिक',
    agricultural: 'कृषि',
    plot: 'प्लॉट',
    land: 'भूमि',

    // Possession Status
    vacant: 'खाली',
    occupied: 'कब्जा किया हुआ',
    underConstruction: 'निर्माणाधीन',

    // Auction Types
    physical: 'भौतिक',
    symbolic: 'प्रतीकात्मक',
    upcoming: 'आगामी',

    // Auction Acts
    sarfaesiAct: 'सारफेसी अधिनियम',
    drtAct: 'डीआरटी अधिनियम',
    other: 'अन्य',

    // Zones
    north: 'उत्तर',
    south: 'दक्षिण',
    east: 'पूर्व',
    west: 'पश्चिम',
    central: 'केंद्र',

    // Messages
    noAuctionsAvailable: 'कोई नीलामी उपलब्ध नहीं',
    noAuctionsMatchFilters: 'आपके वर्तमान फिल्टर से कोई नीलामी मेल नहीं खाती।',
    noPastAuctions: 'कोई पिछली नीलामी नहीं',
    loadingAuctions: 'नीलामियां लोड हो रही हैं...',
    failedToLoadAuctions: 'नीलामियां लोड करने में विफल। कृपया पुनः प्रयास करें।',
    auctionSavedSuccessfully: 'नीलामी सफलतापूर्वक सहेजी गई',
    auctionUpdatedSuccessfully: 'नीलामी सफलतापूर्वक अपडेट की गई',
    auctionDeletedSuccessfully: 'नीलामी सफलतापूर्वक हटाई गई',

    // Validation Messages
    auctionTypeRequired: 'नीलामी प्रकार आवश्यक है',
    cityRequired: 'शहर आवश्यक है',
    bankAgencyRequired: 'बैंक/एजेंसी आवश्यक है',
    propertyTypeRequired: 'संपत्ति प्रकार आवश्यक है',
    addressRequired: 'पता आवश्यक है',
    descriptionRequired: 'विवरण आवश्यक है',
    possessionRequired: 'कब्जा स्थिति आवश्यक है',
    reservePriceRequired: 'आरक्षित मूल्य आवश्यक है',
    emdAmountRequired: 'ईएमडी राशि आवश्यक है',
    bidIncrementRequired: 'बोली वृद्धि आवश्यक है',
    auctionDateRequired: 'नीलामी तिथि आवश्यक है',
    inspectionDateRequired: 'निरीक्षण तिथि आवश्यक है',
    emdSubmissionDateRequired: 'ईएमडी जमा तिथि आवश्यक है',
    locationRequired: 'नीलामी स्थान आवश्यक है',
    contactRequired: 'संपर्क आवश्यक है',
    reservePriceInvalid: 'आरक्षित मूल्य एक वैध संख्या होनी चाहिए',
    emdAmountInvalid: 'ईएमडी राशि एक वैध संख्या होनी चाहिए',
    bidIncrementInvalid: 'बोली वृद्धि एक वैध संख्या होनी चाहिए',
    auctionDateFuture: 'नीलामी तिथि भविष्य में होनी चाहिए',
    inspectionBeforeAuction: 'निरीक्षण तिथि नीलामी तिथि से पहले होनी चाहिए',
    emdBeforeAuction: 'ईएमडी जमा तिथि नीलामी तिथि से पहले होनी चाहिए',

    // Stats
    active: 'सक्रिय',
    myAuctions: 'मेरी नीलामियां',
    upcoming: 'आगामी',
    past: 'पिछली',

    // Confirmation Messages
    confirmDelete: 'हटाना पुष्टि करें',
    deleteAuctionConfirmation: 'क्या आप वाकई इस नीलामी को हटाना चाहते हैं? यह क्रिया वापस नहीं की जा सकती।',
    deleteAuction: 'नीलामी हटाएं',
    changingAuctionDate: 'नीलामी तिथि बदलने से यह नीलामी उपलब्ध टैब में चली जाएगी। जारी रखें?',

    // Placeholders
    selectCity: 'शहर चुनें',
    selectState: 'राज्य चुनें',
    selectZone: 'क्षेत्र चुनें',
    enterBankAgency: 'बैंक या एजेंसी का नाम दर्ज करें',
    enterPropertyAddress: 'संपत्ति का पता दर्ज करें',
    enterPropertyDescription: 'संपत्ति का विस्तृत विवरण',
    enterAuctionVenue: 'नीलामी के लिए स्थान या लिंक',
    enterContact: 'संपर्क व्यक्ति या फोन',
    enterCersaiId: 'वैकल्पिक सीईआरएसएआई आईडी',
    enterRegistrantName: 'पंजीकरणकर्ता का नाम',
    enterEmail: 'ईमेल पता',
    enterContactNumber: 'संपर्क नंबर',
    enterRegistrationAddress: 'पंजीकरण पता',

    // Filter Labels
    allCities: 'सभी शहर',
    allPropertyTypes: 'सभी संपत्ति प्रकार',
    searchByBankAgency: 'बैंक/एजेंसी द्वारा खोजें',
    clearFilters: 'फिल्टर साफ करें',

    // Empty States
    noAuctionsYet: 'आपने अभी तक कोई नीलामी संपत्ति नहीं बनाई है, या आपकी सभी नीलामियां अभी भी सक्रिय हैं।',
    noActiveAuctions: 'इस समय कोई सक्रिय नीलामी संपत्ति नहीं है।',

    // Error Messages
    errorAddingAuction: 'नीलामी जोड़ने में त्रुटि। कृपया पुनः प्रयास करें।',
    errorUpdatingAuction: 'नीलामी अपडेट करने में त्रुटि। कृपया पुनः प्रयास करें।',
    errorDeletingAuction: 'नीलामी हटाने में त्रुटि। कृपया पुनः प्रयास करें।',
    errorLoadingAuctions: 'नीलामियां लोड करने में त्रुटि। कृपया पुनः प्रयास करें।',
    onlyAdminCanAdd: 'केवल प्रशासक और सुपर प्रशासक नीलामी जोड़ सकते हैं',
  },

  // Marathi (mr)
  mr: {
    // Navigation
    auctions: 'लिलाव',
    availableAuctions: 'उपलब्ध लिलाव',
    myAuctions: 'माझे लिलाव',

    // Common Actions
    addAuctionProperty: 'लिलाव मालमत्ता जोडा',
    editAuction: 'लिलाव संपादित करा',
    deleteAuction: 'लिलाव हटवा',
    viewDetails: 'तपशील पहा',
    saveAuction: 'लिलाव जतन करा',
    updateAuction: 'लिलाव अपडेट करा',
    cancel: 'रद्द करा',
    close: 'बंद करा',

    // Form Labels
    auctionType: 'लिलाव प्रकार',
    city: 'शहर',
    bankAgency: 'बँक/एजन्सी',
    propertyType: 'मालमत्ता प्रकार',
    address: 'पत्ता/क्षेत्र',
    possession: 'ताबा स्थिती',
    propertyDescription: 'मालमत्ता वर्णन',
    reservePrice: 'आरक्षित किंमत (₹)',
    emdAmount: 'ईएमडी रक्कम (₹)',
    bidIncrement: 'बोली वाढ (₹)',
    auctionDate: 'लिलाव तारीख',
    inspectionDate: 'तपासणी तारीख',
    emdSubmissionDate: 'ईएमडी सादर तारीख',
    auctionVenue: 'लिलाव स्थळ',
    contact: 'संपर्क',
    cersaiId: 'सीईआरएसएआई आयडी',
    auctionAct: 'लिलाव कायदा',
    paperNotice: 'कागद सूचना उपलब्ध',

    // Property Boundaries
    propertyBoundaries: 'मालमत्ता सीमा',
    east: 'पूर्व',
    west: 'पश्चिम',
    north: 'उत्तर',
    south: 'दक्षिण',

    // Registration Details
    auctionRegistrationDetails: 'लिलाव नोंदणी तपशील',
    name: 'नाव',
    state: 'राज्य',
    zone: 'झोन',
    email: 'ईमेल आयडी',
    registrationAddress: 'पत्ता',

    // Property Types
    residential: 'निवासी',
    commercial: 'व्यावसायिक',
    industrial: 'औद्योगिक',
    agricultural: 'कृषी',
    plot: 'प्लॉट',
    land: 'जमीन',

    // Possession Status
    vacant: 'रिक्त',
    occupied: 'ताब्यात',
    underConstruction: 'बांधकामाधीन',

    // Auction Types
    physical: 'भौतिक',
    symbolic: 'प्रतिकात्मक',
    upcoming: 'आगामी',

    // Auction Acts
    sarfaesiAct: 'सारफेसी कायदा',
    drtAct: 'डीआरटी कायदा',
    other: 'इतर',

    // Zones
    north: 'उत्तर',
    south: 'दक्षिण',
    east: 'पूर्व',
    west: 'पश्चिम',
    central: 'मध्य',

    // Messages
    noAuctionsAvailable: 'कोणताही लिलाव उपलब्ध नाही',
    noAuctionsMatchFilters: 'तुमच्या वर्तमान फिल्टरशी कोणताही लिलाव जुळत नाही.',
    noPastAuctions: 'कोणताही मागील लिलाव नाही',
    loadingAuctions: 'लिलाव लोड होत आहेत...',
    failedToLoadAuctions: 'लिलाव लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    auctionSavedSuccessfully: 'लिलाव यशस्वीरीत्या जतन केला',
    auctionUpdatedSuccessfully: 'लिलाव यशस्वीरीत्या अपडेट केला',
    auctionDeletedSuccessfully: 'लिलाव यशस्वीरीत्या हटवला',

    // Validation Messages
    auctionTypeRequired: 'लिलाव प्रकार आवश्यक आहे',
    cityRequired: 'शहर आवश्यक आहे',
    bankAgencyRequired: 'बँक/एजन्सी आवश्यक आहे',
    propertyTypeRequired: 'मालमत्ता प्रकार आवश्यक आहे',
    addressRequired: 'पत्ता आवश्यक आहे',
    descriptionRequired: 'वर्णन आवश्यक आहे',
    possessionRequired: 'ताबा स्थिती आवश्यक आहे',
    reservePriceRequired: 'आरक्षित किंमत आवश्यक आहे',
    emdAmountRequired: 'ईएमडी रक्कम आवश्यक आहे',
    bidIncrementRequired: 'बोली वाढ आवश्यक आहे',
    auctionDateRequired: 'लिलाव तारीख आवश्यक आहे',
    inspectionDateRequired: 'तपासणी तारीख आवश्यक आहे',
    emdSubmissionDateRequired: 'ईएमडी सादर तारीख आवश्यक आहे',
    locationRequired: 'लिलाव स्थळ आवश्यक आहे',
    contactRequired: 'संपर्क आवश्यक आहे',
    reservePriceInvalid: 'आरक्षित किंमत वैध संख्या असली पाहिजे',
    emdAmountInvalid: 'ईएमडी रक्कम वैध संख्या असली पाहिजे',
    bidIncrementInvalid: 'बोली वाढ वैध संख्या असली पाहिजे',
    auctionDateFuture: 'लिलाव तारीख भविष्यात असली पाहिजे',
    inspectionBeforeAuction: 'तपासणी तारीख लिलाव तारीखपूर्वी असली पाहिजे',
    emdBeforeAuction: 'ईएमडी सादर तारीख लिलाव तारीखपूर्वी असली पाहिजे',

    // Stats
    active: 'सक्रिय',
    myAuctions: 'माझे लिलाव',
    upcoming: 'आगामी',
    past: 'मागील',

    // Confirmation Messages
    confirmDelete: 'हटवणे पुष्टी करा',
    deleteAuctionConfirmation: 'तुम्हाला खरोखर हा लिलाव हटवायचा आहे का? ही क्रिया पूर्ववत केली जाऊ शकत नाही.',
    deleteAuction: 'लिलाव हटवा',
    changingAuctionDate: 'लिलाव तारीख बदलल्याने हा लिलाव उपलब्ध टॅबमध्ये जाईल. सुरू ठेवायचे?',

    // Placeholders
    selectCity: 'शहर निवडा',
    selectState: 'राज्य निवडा',
    selectZone: 'झोन निवडा',
    enterBankAgency: 'बँक किंवा एजन्सीचे नाव प्रविष्ट करा',
    enterPropertyAddress: 'मालमत्तेचा पत्ता प्रविष्ट करा',
    enterPropertyDescription: 'मालमत्तेचे तपशीलवार वर्णन',
    enterAuctionVenue: 'लिलावासाठी स्थळ किंवा दुवा',
    enterContact: 'संपर्क व्यक्ती किंवा फोन',
    enterCersaiId: 'पर्यायी सीईआरएसएआई आयडी',
    enterRegistrantName: 'नोंदणी करणाऱ्याचे नाव',
    enterEmail: 'ईमेल पत्ता',
    enterContactNumber: 'संपर्क क्रमांक',
    enterRegistrationAddress: 'नोंदणी पत्ता',

    // Filter Labels
    allCities: 'सर्व शहर',
    allPropertyTypes: 'सर्व मालमत्ता प्रकार',
    searchByBankAgency: 'बँक/एजन्सी द्वारा शोधा',
    clearFilters: 'फिल्टर साफ करा',

    // Empty States
    noAuctionsYet: 'तुम्ही अद्याप कोणतीही लिलाव मालमत्ता तयार केली नाही, किंवा तुमचे सर्व लिलाव अजूनही सक्रिय आहेत.',
    noActiveAuctions: 'सध्या कोणतीही सक्रिय लिलाव मालमत्ता नाही.',

    // Error Messages
    errorAddingAuction: 'लिलाव जोडण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    errorUpdatingAuction: 'लिलाव अपडेट करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    errorDeletingAuction: 'लिलाव हटवण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    errorLoadingAuctions: 'लिलाव लोड करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    onlyAdminCanAdd: 'फक्त प्रशासक आणि सुपर प्रशासक लिलाव जोडू शकतात',
  }
};

// Helper function to get localized string
export const getAuctionString = (key, language = 'en') => {
  return auctionStrings[language]?.[key] || auctionStrings.en[key] || key;
};

// Helper function to get current language from localStorage or default to 'en'
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'en';
};

// Helper function to set current language
export const setCurrentLanguage = (language) => {
  localStorage.setItem('language', language);
};
