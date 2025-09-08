# 🎨 Animated Theme Toggle Documentation

## Overview

The Animated Theme Toggle is a sophisticated component that provides smooth, visually appealing transitions when switching between light and dark themes. It uses the modern View Transitions API and Framer Motion for animations.

## 🚀 Features

### Animation Variants
- **Circle**: Smooth circular reveal animation
- **Rectangle**: Directional reveal animations (bottom-up, top-down, left-right, right-left)
- **Polygon**: Geometric polygon-based transitions
- **Circle-blur**: Circle animation with blur effects
- **GIF**: Custom GIF-based mask animations

### Animation Start Positions
- **Center**: Animation starts from the center
- **Corners**: top-left, top-right, bottom-left, bottom-right
- **Edges**: top-center, bottom-center
- **Directions**: bottom-up, top-down, left-right, right-left

### Additional Effects
- **Blur**: Optional blur effects during transitions
- **Custom GIFs**: Support for custom GIF animations
- **Responsive**: Works on all screen sizes

## 📁 Components

### 1. SimpleAnimatedThemeToggle
A simplified version for easy integration into existing components.

```tsx
import { SimpleAnimatedThemeToggle } from './components/SimpleAnimatedThemeToggle';

<SimpleAnimatedThemeToggle 
  variant="circle"
  start="center"
  className="custom-class"
/>
```

**Props:**
- `variant`: "circle" | "rectangle"
- `start`: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
- `blur`: boolean (optional)
- `className`: string (optional)

### 2. AnimatedThemeToggle
Full-featured component with all animation options and controls.

```tsx
import { AnimatedThemeToggle } from './components/AnimatedThemeToggle';

<AnimatedThemeToggle />
```

### 3. ThemeToggleDemo
Demo page showcasing all animation variants and options.

**Access**: Navigate to `/theme-demo` in your application.

## 🔧 Integration

### Dashboard Integration
The animated theme toggle has been integrated into:
- **Dashboard**: Replaces the old Sun/Moon toggle
- **Exam Component**: Consistent theme switching experience

### Usage in Your Components

```tsx
import { SimpleAnimatedThemeToggle } from './components/SimpleAnimatedThemeToggle';

export function YourComponent() {
  return (
    <div className="flex items-center space-x-4">
      <SimpleAnimatedThemeToggle 
        variant="circle"
        start="center"
        className="bg-transparent border border-slate-600 hover:bg-slate-700/50"
      />
    </div>
  );
}
```

## 🎯 Animation Examples

### Circle Animation (Center)
```tsx
<SimpleAnimatedThemeToggle 
  variant="circle"
  start="center"
/>
```

### Rectangle Animation (Bottom-up)
```tsx
<SimpleAnimatedThemeToggle 
  variant="rectangle"
  start="bottom-up"
/>
```

### Circle with Blur Effect
```tsx
<SimpleAnimatedThemeToggle 
  variant="circle"
  start="center"
  blur={true}
/>
```

## 🛠️ Technical Details

### Dependencies
- **framer-motion**: For smooth animations and transitions
- **View Transitions API**: For native browser transitions
- **CSS Clip-path**: For geometric animations
- **CSS Masks**: For GIF-based animations

### Browser Support
- **Chrome 111+**: Full support with View Transitions API
- **Other Browsers**: Graceful fallback to instant theme switching
- **Mobile**: Fully responsive and touch-friendly

### Performance
- **Lightweight**: Minimal impact on bundle size
- **Smooth**: 60fps animations
- **Efficient**: Uses native browser APIs when available

## 🎨 Customization

### Custom Styling
```tsx
<SimpleAnimatedThemeToggle 
  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-lg"
  variant="circle"
  start="center"
/>
```

### Custom Animation Duration
The animations use CSS custom properties for timing:
```css
::view-transition-group(root) {
  animation-duration: 0.7s; /* Customize duration */
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🔍 Demo & Testing

### Live Demo
Visit `/theme-demo` to see all animation variants in action.

### Testing Different Variants
1. Navigate to the demo page
2. Use the draggable options panel
3. Try different variants and start positions
4. Toggle blur effects
5. Test with different GIF animations

### Browser Testing
- Test in Chrome for full View Transitions API support
- Test in other browsers for fallback behavior
- Test on mobile devices for touch interactions

## 🚀 Advanced Usage

### Custom Hook
```tsx
import { useThemeToggle } from './components/AnimatedThemeToggle';

const { isDark, toggleTheme } = useThemeToggle({
  variant: "circle",
  start: "center",
  blur: false
});
```

### Programmatic Theme Switching
```tsx
const { setCrazyLightTheme, setCrazyDarkTheme } = useThemeToggle();

// Switch to light theme with animation
setCrazyLightTheme();

// Switch to dark theme with animation
setCrazyDarkTheme();
```

## 🐛 Troubleshooting

### Common Issues

**Animation not working:**
- Ensure you're using Chrome 111+ for full support
- Check that framer-motion is properly installed
- Verify the theme provider is set up correctly

**Performance issues:**
- Reduce animation complexity for older devices
- Use simpler variants (circle, rectangle) instead of complex ones
- Disable blur effects if needed

**Styling conflicts:**
- Use specific CSS classes to override default styles
- Check for conflicting CSS transitions
- Ensure proper z-index values

### Browser Compatibility
```tsx
// Check for View Transitions API support
if (!document.startViewTransition) {
  // Fallback to instant theme switching
  setTheme(newTheme);
} else {
  // Use animated transitions
  document.startViewTransition(() => setTheme(newTheme));
}
```

## 📚 Resources

- [View Transitions API Documentation](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Clip-path Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [CSS Masks Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/mask)

## 🎉 Conclusion

The Animated Theme Toggle provides a modern, engaging way to switch themes in your application. With multiple animation variants and smooth transitions, it enhances the user experience while maintaining excellent performance and browser compatibility.

**Live Demo**: Navigate to `/theme-demo` to explore all features!
