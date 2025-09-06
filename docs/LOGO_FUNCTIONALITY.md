# Logo Display and Change Functionality

## Overview

This document describes the comprehensive logo management system implemented for the Adelbaba Dashboard onboarding form. The system handles both existing company logos from the API and new logo uploads with seamless user experience.

## Key Features

### ✅ 1. Existing Logo Display
- **Automatic Loading**: Existing company logos are automatically loaded from the API
- **Visual Display**: Logos are displayed in a professional 80x80px container
- **Fallback Handling**: Graceful fallback to placeholder when no logo exists

### ✅ 2. Logo Change Functionality
- **Upload New Logo**: Users can upload new logo files (PNG/JPG, ≤ 2MB)
- **Replace Existing**: Seamless replacement of existing logos
- **Preview**: Real-time preview of uploaded logos before saving

### ✅ 3. Logo Removal
- **Complete Removal**: Users can remove both existing and new logos
- **API Integration**: Proper API calls to remove logos from the backend
- **State Management**: Clean state management for logo removal

### ✅ 4. User Experience
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Visual Feedback**: Clear visual indicators for different logo states
- **Error Handling**: Comprehensive error handling for upload failures

## Implementation Details

### State Management

```typescript
const [businessProfile, setBusinessProfile] = useState({
  logo: null as File | null,           // New uploaded file
  existingLogoUrl: "" as string,      // Existing logo URL from API
  companyName: "",
  foundedYear: "",
  description: "",
  // ... other fields
})
```

### Logo Display Logic

The system intelligently displays logos based on priority:

1. **New Upload**: If a new file is uploaded, it takes priority
2. **Existing Logo**: If no new file, display the existing logo from API
3. **Placeholder**: If neither exists, show upload prompt

```typescript
const logoSource = businessProfile.logo 
  ? URL.createObjectURL(businessProfile.logo) 
  : businessProfile.existingLogoUrl || "/placeholder.svg"
```

### API Integration

The system properly handles different logo scenarios:

```typescript
const updateData: any = {
  name: businessProfile.companyName,
  description: businessProfile.description,
  founded_year: businessProfile.foundedYear ? parseInt(businessProfile.foundedYear) : undefined,
  logo: businessProfile.logo || undefined,
  contacts: contacts.length > 0 ? contacts : undefined,
}

// Handle logo removal
if (!businessProfile.logo && !businessProfile.existingLogoUrl) {
  updateData.remove_logo = true
  delete updateData.logo
}
```

## User Interface

### Logo Upload Area

```tsx
<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
  {(businessProfile.logo || businessProfile.existingLogoUrl) ? (
    <div className="space-y-4">
      {/* Logo Display */}
      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-white shadow-sm">
        <Image
          src={logoSource}
          alt="Company logo"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <Button onClick={() => document.getElementById("logo-upload")?.click()}>
          {businessProfile.logo ? "Replace" : "Change Logo"}
        </Button>
        <Button onClick={handleLogoRemove}>Remove</Button>
      </div>
      
      {/* Status Indicator */}
      {businessProfile.existingLogoUrl && !businessProfile.logo && (
        <p className="text-xs text-gray-500">
          Current logo from your company profile
        </p>
      )}
    </div>
  ) : (
    <div className="space-y-4">
      <Upload className="h-12 w-12 mx-auto text-gray-400" />
      <div>
        <Button onClick={() => document.getElementById("logo-upload")?.click()}>
          Upload Logo
        </Button>
        <p className="text-sm text-gray-500 mt-2">PNG/JPG, ≤ 2 MB</p>
      </div>
    </div>
  )}
</div>
```

## File Upload Handling

### Validation
- **File Type**: Only PNG and JPEG images allowed
- **File Size**: Maximum 2MB file size
- **Error Handling**: Graceful handling of invalid files

### Upload Process
```typescript
const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file && (file.type === "image/png" || file.type === "image/jpeg") && file.size <= 2 * 1024 * 1024) {
    setBusinessProfile((prev) => ({ 
      ...prev, 
      logo: file,
      existingLogoUrl: "" // Clear existing logo URL when new file is uploaded
    }))
  }
}
```

## Data Flow

### 1. Initial Load
```
Component Mount → Fetch Company Data → Populate existingLogoUrl → Display Logo
```

### 2. Logo Upload
```
User Selects File → Validation → Update State → Preview Display → Save to API
```

### 3. Logo Removal
```
User Clicks Remove → Clear State → Update API → Refresh Display
```

## API Endpoints

### Company Data Fetch
```
GET /api/v1/company
Response: {
  "data": {
    "logo": "https://example.com/logo.png",
    // ... other company data
  }
}
```

### Company Update
```
POST /api/v1/company/update
Content-Type: multipart/form-data

FormData:
- name: "Company Name"
- description: "Company Description"
- logo: File (if new logo uploaded)
- remove_logo: "1" (if logo should be removed)
- contacts[0][phone]: "+1234567890"
- contacts[0][email]: "contact@company.com"
- contacts[0][is_primary]: "1"
```

## Error Handling

### Upload Errors
- Invalid file type
- File too large
- Network errors
- Server errors

### Display Errors
- Broken image URLs
- Missing files
- API failures

## Security Considerations

1. **File Validation**: Strict file type and size validation
2. **XSS Prevention**: Proper image URL handling
3. **CSRF Protection**: Form data includes proper tokens
4. **Input Sanitization**: All user inputs are sanitized

## Performance Optimizations

1. **Lazy Loading**: Images are loaded only when needed
2. **Caching**: Existing logos are cached in localStorage
3. **Compression**: Images are optimized for web display
4. **Memory Management**: Proper cleanup of object URLs

## Testing

### Test Cases
1. **Existing Logo Display**: Verify existing logos load correctly
2. **New Logo Upload**: Test file upload functionality
3. **Logo Replacement**: Test replacing existing logos
4. **Logo Removal**: Test complete logo removal
5. **Error Handling**: Test various error scenarios
6. **Mobile Responsiveness**: Test on different screen sizes

### Test Data
```typescript
// Existing logo URL
const existingLogoUrl = "https://adilbaba.test/storage/1852/44c89539e9b2ae7ffc7d1926f355ff8eafac4dde.png"

// Test file upload
const testFile = new File(["test"], "logo.png", { type: "image/png" })
```

## Accessibility

### ARIA Labels
- Proper alt text for images
- Screen reader friendly labels
- Keyboard navigation support

### Visual Indicators
- Clear upload area boundaries
- Hover states for interactive elements
- Loading states for uploads

## Browser Compatibility

- **Modern Browsers**: Full support for all features
- **File API**: Uses standard File API
- **Image Display**: Uses Next.js Image component
- **Form Data**: Uses FormData for file uploads

## Future Enhancements

### Potential Improvements
1. **Image Cropping**: Add image cropping functionality
2. **Multiple Formats**: Support for more image formats
3. **Drag & Drop**: Add drag and drop file upload
4. **Progress Indicators**: Show upload progress
5. **Image Optimization**: Automatic image optimization
6. **Cloud Storage**: Direct cloud storage integration

### Advanced Features
1. **Logo Templates**: Pre-designed logo templates
2. **Brand Guidelines**: Automatic brand compliance checking
3. **Logo History**: Version history for logo changes
4. **Bulk Upload**: Support for multiple logo uploads

## Troubleshooting

### Common Issues

1. **Logo Not Displaying**
   - Check if URL is accessible
   - Verify image format is supported
   - Check browser console for errors

2. **Upload Failing**
   - Verify file size is under 2MB
   - Check file format is PNG/JPEG
   - Ensure network connectivity

3. **Logo Not Saving**
   - Check API endpoint is accessible
   - Verify authentication token
   - Check server logs for errors

### Debug Tools

```typescript
// Debug logging
console.log("Current logo state:", {
  hasNewFile: !!businessProfile.logo,
  hasExistingUrl: !!businessProfile.existingLogoUrl,
  displaySource: logoSource
})
```

## Conclusion

The logo functionality provides a comprehensive, user-friendly system for managing company logos in the onboarding process. It handles all edge cases, provides excellent user experience, and maintains data integrity throughout the process. The implementation is mobile-first, accessible, and follows React best practices.
