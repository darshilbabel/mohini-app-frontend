# Test Images

This directory contains sample images for testing image upload and removal functionality.

## Test Images

The following test images should be placed in this directory:

- `test-image-1.png` - First test image
- `test-image-2.png` - Second test image
- `test-image-3.png` - Third test image

## Generating Test Images

You can generate test images using the `ImageHelper.createSampleImage()` method in your tests, or manually add your own test images to this directory.

### Using ImageHelper (Recommended)

```typescript
import { ImageHelper } from '@helpers/image.helper';

const imageHelper = new ImageHelper(page);
await imageHelper.createSampleImage('tests/fixtures/images/test-image-1.png', 800, 600);
```

### Manual Images

You can also add your own test images (JPG, PNG, GIF, WebP) to this directory. Make sure they are:
- Valid image files
- Reasonably sized (< 10MB)
- In common formats (JPG, PNG, GIF, WebP)

## Image Requirements

- **Format**: JPG, PNG, GIF, WebP
- **Maximum size**: 10MB
- **Minimum dimensions**: 50x50 pixels
- **Maximum dimensions**: 4096x4096 pixels

## Notes

- Images in this directory are used across multiple test scenarios
- Keep test images small to speed up test execution
- Use descriptive names for different test scenarios
- Add new images as needed for specific test cases

