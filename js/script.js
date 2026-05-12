(function() {
    let html2pdfLoaded = false;

    function loadHtml2Pdf() {
        return new Promise((resolve, reject) => {
            if (typeof html2pdf !== 'undefined') {
                html2pdfLoaded = true;
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
                html2pdfLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleAnimation {
            from {
                transform: scale(0);
                opacity: 0.8;
            }
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    document.querySelectorAll('.card, .job, .tag, .contact__email, .name-card, .profile-card, .edu-card').forEach(el => {
        if (!el.hasAttribute('data-ripple-initialized')) {
            el.setAttribute('data-ripple-initialized', 'true');
            el.style.position = 'relative';
            el.style.overflow = 'hidden';
            el.style.cursor = 'pointer';
            el.addEventListener('click', function(e) {
                const existingRipple = this.querySelector('.ripple-effect');
                if (existingRipple) existingRipple.remove();
                
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(40, 217, 121, 0.3) 0%, rgba(40, 217, 121, 0.1) 100%);
                    transform: translate(${x}px, ${y}px) scale(0);
                    animation: rippleAnimation 0.6s ease-out;
                    pointer-events: none;
                    z-index: 100;
                `;
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        }
    });

    const editableSelectors = [
        '.name-card__name',
        '.name-card__role',
        '.name-card__hello',
        '.languages__names li',
        '.section-title',
        '.job__date',
        '.job__pill',
        '.job__title',
        '.job__company',
        '.job__list li',
        '.tools__heading',
        '.tools__tag',
        '.edu-card__year',
        '.edu-card__degree',
        '.edu-tags',
        '.edu-card__school',
        '.tag',
        '.contact__lead',
        '.contact__email'
    ];

    const savedData = localStorage.getItem('resume-data');
    if (savedData) {
        const data = JSON.parse(savedData);
        for (const [selector, text] of Object.entries(data)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, idx) => {
                if (text[idx] !== undefined && el.textContent !== text[idx]) {
                    el.textContent = text[idx];
                }
            });
        }
    }

    editableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.classList.add('editable');
            el.setAttribute('data-original-text', el.textContent);
            
            el.addEventListener('focus', function() {
                this.style.backgroundColor = 'rgba(40, 217, 121, 0.15)';
            });
            
            el.addEventListener('blur', function() {
                this.style.backgroundColor = '';
                const data = {};
                editableSelectors.forEach(sel => {
                    const els = document.querySelectorAll(sel);
                    data[sel] = Array.from(els).map(e => e.textContent);
                });
                localStorage.setItem('resume-data', JSON.stringify(data));
            });
        });
    });

    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .editable {
            cursor: text;
            transition: background-color 0.2s ease;
            border-radius: 4px;
        }
        .editable:hover {
            background-color: rgba(40, 217, 121, 0.1);
        }
        .editable:focus {
            outline: none;
            background-color: rgba(40, 217, 121, 0.15);
        }
    `;
    document.head.appendChild(animationStyles);

    const profileImg = document.querySelector('.profile-card__img');
    if (profileImg) {
        const savedImage = localStorage.getItem('resume-image');
        if (savedImage) {
            profileImg.src = savedImage;
        }
        profileImg.style.cursor = 'pointer';
        profileImg.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        profileImg.src = event.target.result;
                        localStorage.setItem('resume-image', event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }

    const toolsImages = document.querySelectorAll('.tools__icons img, .tools__nocode-img img');
    if (toolsImages.length > 0) {
        const savedToolsImages = localStorage.getItem('resume-tools-images');
        if (savedToolsImages) {
            const imagesData = JSON.parse(savedToolsImages);
            toolsImages.forEach((img, index) => {
                if (imagesData[index] && imagesData[index] !== img.src) {
                    img.src = imagesData[index];
                }
            });
        }
        
        toolsImages.forEach((img, imgIndex) => {
            img.style.cursor = 'pointer';
            img.style.transition = 'transform 0.2s ease';
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.1)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            img.src = ev.target.result;
                            const allImages = document.querySelectorAll('.tools__icons img, .tools__nocode-img img');
                            const imagesDataArray = [];
                            allImages.forEach(image => {
                                imagesDataArray.push(image.src);
                            });
                            localStorage.setItem('resume-tools-images', JSON.stringify(imagesDataArray));
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            });
        });
    }

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📄 Скачать PDF';
    downloadBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: #28d979;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 24px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    `;
    downloadBtn.onmouseenter = () => {
        downloadBtn.style.transform = 'translateY(-2px)';
        downloadBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    };
    downloadBtn.onmouseleave = () => {
        downloadBtn.style.transform = 'translateY(0)';
        downloadBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };
    downloadBtn.onclick = async () => {
        await loadHtml2Pdf();
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10000;
            display: flex; justify-content: center; align-items: center;
            flex-direction: column;
        `;
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 50px; height: 50px;
            border: 4px solid #fff; border-top: 4px solid #28d979;
            border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;
        `;
        const text = document.createElement('div');
        text.textContent = 'Создание PDF...';
        text.style.cssText = 'color: white; font-family: Poppins, sans-serif;';
        const spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(spinStyle);
        overlay.appendChild(spinner);
        overlay.appendChild(text);
        document.body.appendChild(overlay);
        
        try {
            const element = document.querySelector('.cv-page');
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc, element) => {
                        const clonedImages = clonedDoc.querySelectorAll('.tools__icons img, .tools__nocode-img img');
                        clonedImages.forEach(img => {
                            if (img.style) {
                                img.style.maxWidth = '100%';
                                img.style.height = 'auto';
                                img.style.objectFit = 'contain';
                            }
                        });
                    }
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF Error:', error);
            alert('Ошибка при создании PDF');
        } finally {
            overlay.remove();
        }
    };
    document.body.appendChild(downloadBtn);
})();