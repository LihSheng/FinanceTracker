# Favicon Setup Guide

## Current Setup

The Finance Tracker app uses a custom SVG favicon with the following features:

- **Green gradient background** (#10B981 to #059669) - representing growth and finance
- **Dollar sign ($)** - central symbol for finance
- **Growth arrow** - indicating financial growth
- **Chart line** - representing portfolio tracking

## Files

### App Directory (Next.js 13+ App Router)

- `app/icon.svg` - Main SVG favicon (automatically used by Next.js)
- `app/favicon.ico` - Fallback ICO format (placeholder)
- `app/apple-icon.png` - Apple touch icon (placeholder)
- `app/manifest.json` - PWA manifest

## How It Works

Next.js 13+ automatically detects and serves these files:

1. **icon.svg** - Used as the primary favicon
2. **favicon.ico** - Fallback for older browsers
3. **apple-icon.png** - Used for iOS home screen icons

The metadata in `app/layout.tsx` configures the icons:

```typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
};
```

## Customization

### Change Colors

Edit `app/icon.svg` and modify the gradient colors:

```svg
<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style="stop-color:#YOUR_COLOR;stop-opacity:1" />
  <stop offset="100%" style="stop-color:#YOUR_COLOR;stop-opacity:1" />
</linearGradient>
```

### Change Design

The SVG is fully editable. You can:
- Modify the dollar sign
- Change the arrow direction
- Adjust the chart line
- Add/remove elements

## Production Setup

For production, you should create actual image files:

### 1. Create favicon.ico

Convert the SVG to ICO format (16x16, 32x32, 48x48):
- Use online tools: https://convertio.co/svg-ico/
- Or use ImageMagick: `convert icon.svg -define icon:auto-resize=16,32,48 favicon.ico`

### 2. Create apple-icon.png

Create a 180x180 PNG for Apple devices:
- Use online tools: https://convertio.co/svg-png/
- Or use ImageMagick: `convert icon.svg -resize 180x180 apple-icon.png`

### 3. Additional Sizes (Optional)

For better PWA support, create multiple sizes:
- 192x192 (Android)
- 512x512 (Android)
- 180x180 (iOS)

## Testing

1. **Local Development**: 
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Check browser tab for new icon

2. **Production**:
   - Deploy changes
   - Clear CDN cache if applicable
   - Test on multiple browsers

3. **PWA**:
   - Test "Add to Home Screen" on mobile
   - Verify icon appears correctly

## Browser Support

- ✅ Chrome/Edge (SVG favicon)
- ✅ Firefox (SVG favicon)
- ✅ Safari (SVG favicon)
- ✅ iOS Safari (apple-icon.png)
- ✅ Android Chrome (icon.svg)
- ⚠️ IE11 (falls back to favicon.ico)

## Troubleshooting

### Favicon not updating?

1. Clear browser cache
2. Hard refresh the page
3. Check browser DevTools Network tab
4. Verify file exists at `/icon.svg`
5. Try incognito/private mode

### Wrong icon showing?

1. Check metadata in `app/layout.tsx`
2. Verify file names match exactly
3. Check file permissions
4. Restart dev server

### PWA icon issues?

1. Check `manifest.json` configuration
2. Verify icon sizes are correct
3. Test on actual device
4. Check browser console for errors

## Resources

- [Next.js Metadata Files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [SVG Favicon Guide](https://css-tricks.com/svg-favicons-and-all-the-fun-things-we-can-do-with-them/)
- [PWA Icons](https://web.dev/add-manifest/)
