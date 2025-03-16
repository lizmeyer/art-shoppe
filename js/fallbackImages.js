/**
 * Fallback Images for Cozy Artist Shop
 * Provides CSS-based alternatives when PNG images are not available
 */

// Create fallback elements for product images
function createProductFallback(productId, container) {
    const placeholder = document.createElement('div');
    placeholder.className = 'product-fallback';
    placeholder.style.width = '100%';
    placeholder.style.height = '100%';
    placeholder.style.border = '2px solid #664e56';
    placeholder.style.borderRadius = '5px';
    placeholder.style.backgroundColor = 'white';
    placeholder.style.position = 'relative';
    placeholder.style.display = 'flex';
    placeholder.style.justifyContent = 'center';
    placeholder.style.alignItems = 'center';
    
    // Create specific shapes based on product type
    switch(productId) {
        case 'mug':
            // Create a mug shape
            const mugBase = document.createElement('div');
            mugBase.style.width = '70%';
            mugBase.style.height = '70%';
            mugBase.style.borderRadius = '5px 5px 50% 50% / 5px 5px 30% 30%';
            mugBase.style.border = '3px solid #664e56';
            mugBase.style.borderBottom = '6px solid #664e56';
            mugBase.style.backgroundColor = 'white';
            
            const handle = document.createElement('div');
            handle.style.position = 'absolute';
            handle.style.right = '20%';
            handle.style.top = '30%';
            handle.style.width = '20%';
            handle.style.height = '40%';
            handle.style.borderRadius = '0 50% 50% 0';
            handle.style.border = '3px solid #664e56';
            handle.style.borderLeft = 'none';
            
            placeholder.appendChild(mugBase);
            placeholder.appendChild(handle);
            break;
            
        case 'tote':
            // Create a tote bag shape
            const toteBase = document.createElement('div');
            toteBase.style.width = '70%';
            toteBase.style.height = '80%';
            toteBase.style.border = '3px solid #664e56';
            toteBase.style.borderRadius = '5px 5px 15px 15px';
            toteBase.style.backgroundColor = 'white';
            
            const handleLeft = document.createElement('div');
            handleLeft.style.position = 'absolute';
            handleLeft.style.left = '30%';
            handleLeft.style.top = '10%';
            handleLeft.style.width = '10%';
            handleLeft.style.height = '20%';
            handleLeft.style.borderRadius = '20px 20px 0 0';
            handleLeft.style.border = '3px solid #664e56';
            handleLeft.style.borderBottom = 'none';
            
            const handleRight = document.createElement('div');
            handleRight.style.position = 'absolute';
            handleRight.style.right = '30%';
            handleRight.style.top = '10%';
            handleRight.style.width = '10%';
            handleRight.style.height = '20%';
            handleRight.style.borderRadius = '20px 20px 0 0';
            handleRight.style.border = '3px solid #664e56';
            handleRight.style.borderBottom = 'none';
            
            placeholder.appendChild(toteBase);
            placeholder.appendChild(handleLeft);
            placeholder.appendChild(handleRight);
            break;
            
        case 'shirt':
            // Create a t-shirt shape
            const shirtBase = document.createElement('div');
            shirtBase.style.width = '70%';
            shirtBase.style.height = '60%';
            shirtBase.style.border = '3px solid #664e56';
            shirtBase.style.borderRadius = '0 0 5px 5px';
            shirtBase.style.backgroundColor = 'white';
            shirtBase.style.position = 'relative';
            
            const collar = document.createElement('div');
            collar.style.position = 'absolute';
            collar.style.top = '-15px';
            collar.style.left = '50%';
            collar.style.transform = 'translateX(-50%)';
            collar.style.width = '30%';
            collar.style.height = '15px';
            collar.style.borderRadius = '50% 50% 0 0';
            collar.style.border = '3px solid #664e56';
            collar.style.borderBottom = 'none';
            
            const sleeveLeft = document.createElement('div');
            sleeveLeft.style.position = 'absolute';
            sleeveLeft.style.top = '10px';
            sleeveLeft.style.left = '-20px';
            sleeveLeft.style.width = '20px';
            sleeveLeft.style.height = '40%';
            sleeveLeft.style.transform = 'rotate(25deg)';
            sleeveLeft.style.border = '3px solid #664e56';
            sleeveLeft.style.borderRadius = '5px';
            sleeveLeft.style.backgroundColor = 'white';
            
            const sleeveRight = document.createElement('div');
            sleeveRight.style.position = 'absolute';
            sleeveRight.style.top = '10px';
            sleeveRight.style.right = '-20px';
            sleeveRight.style.width = '20px';
            sleeveRight.style.height = '40%';
            sleeveRight.style.transform = 'rotate(-25deg)';
            sleeveRight.style.border = '3px solid #664e56';
            sleeveRight.style.borderRadius = '5px';
            sleeveRight.style.backgroundColor = 'white';
            
            placeholder.appendChil
