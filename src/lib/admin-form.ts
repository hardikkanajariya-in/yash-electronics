import { fileManager } from './file-manager';
import { buildCloudinaryUrl } from './cloudinary';

interface FormManagerOptions {
  form: HTMLFormElement | string;
  fileInput: HTMLInputElement | string;
  hiddenInput: HTMLInputElement | string;
  previewsContainer: HTMLElement | string;
  folder: string;
  aspectRatio?: number;
  isVideoSupported?: boolean;
  isMultiple?: boolean;
  progressBarId?: string;
  progressContainerId?: string;
  progressStatusId?: string;
  progressPercentId?: string;
  manualSubmit?: boolean;
}

export function setupDeferredUploadForm(options: FormManagerOptions) {
  const form = typeof options.form === 'string' ? document.getElementById(options.form) as HTMLFormElement : options.form;
  const fileInput = typeof options.fileInput === 'string' ? document.getElementById(options.fileInput) as HTMLInputElement : options.fileInput;
  const hiddenInput = typeof options.hiddenInput === 'string' ? document.getElementById(options.hiddenInput) as HTMLInputElement : options.hiddenInput;
  const previewsContainer = typeof options.previewsContainer === 'string' ? document.getElementById(options.previewsContainer) : options.previewsContainer;

  if (!form || !fileInput || !hiddenInput || !previewsContainer) {
    console.warn('[setupDeferredUploadForm] Elements not found:', { form, fileInput, hiddenInput, previewsContainer });
    return null;
  }

  const progressBar = options.progressBarId ? document.getElementById(options.progressBarId) : document.getElementById('upload-progress-bar');
  const progressContainer = options.progressContainerId ? document.getElementById(options.progressContainerId) : document.getElementById('upload-progress-container');
  const progressStatus = options.progressStatusId ? document.getElementById(options.progressStatusId) : document.getElementById('upload-status');
  const progressPercent = options.progressPercentId ? document.getElementById(options.progressPercentId) : document.getElementById('upload-percent');

  let items: Array<{ type: 'uploaded' | 'local'; val: string | File }> = [];
  let removedPublicIds: string[] = [];

  function initItems() {
    const initialVal = hiddenInput.value.trim();
    if (initialVal) {
      if (options.isMultiple) {
        items = initialVal.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ type: 'uploaded', val: id }));
      } else {
        items = [{ type: 'uploaded', val: initialVal }];
      }
    } else {
      items = [];
    }
  }

  function syncHiddenInputFromItems() {
    if (items.length === 0) {
      hiddenInput.value = '';
    } else {
      const vals = items.map(it => (it.type === 'uploaded' ? (it.val as string) : (it.val as File).name));
      hiddenInput.value = options.isMultiple ? vals.join(',') : vals[0];
    }
  }

  function renderPreviews() {
    if (!previewsContainer) return;
    previewsContainer.innerHTML = '';

    if (items.length > 0) {
      previewsContainer.classList.remove('hidden');
    } else {
      previewsContainer.classList.add('hidden');
    }

    items.forEach((item, index) => {
      const isUploaded = item.type === 'uploaded';
      const isVideo = isUploaded 
        ? (item.val as string).endsWith('.mp4') || (item.val as string).endsWith('.webm') || (item.val as string).endsWith('.ogg') || (item.val as string).endsWith('.mov')
        : (item.val as File).type.startsWith('video/');

      let displayUrl = '';
      if (isUploaded) {
        displayUrl = buildCloudinaryUrl(item.val as string, { width: 200, height: 200, crop: 'fill' });
      } else {
        displayUrl = URL.createObjectURL(item.val as File);
      }

      let mediaHtml = '';
      if (isVideo) {
        mediaHtml = `
          <video src="${displayUrl}" class="w-full h-full object-cover" muted playsinline></video>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
            <span class="text-white text-xs">▶</span>
          </div>
        `;
      } else {
        mediaHtml = `<img src="${displayUrl}" class="w-full h-full object-cover" />`;
      }

      const fullMediaUrl = isUploaded ? buildCloudinaryUrl(item.val as string) : displayUrl;
      const div = document.createElement('div');
      div.className = 'relative group w-20 h-20 border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 shadow-sm';
      div.innerHTML = `
        ${mediaHtml}
        <div class="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
          <button type="button" class="preview-trigger-btn w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center text-xs shadow-sm transition-transform hover:scale-110" data-preview-src="${fullMediaUrl}" data-preview-type="${isVideo ? 'video' : 'image'}" title="Preview">👁️</button>
          <button type="button" class="remove-btn-direct w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-sm transition-transform hover:scale-110" title="Remove">🗑️</button>
        </div>
      `;

      div.querySelector('.remove-btn-direct')?.addEventListener('click', () => {
        if (isUploaded) {
          removedPublicIds.push(item.val as string);
        }
        items.splice(index, 1);
        syncHiddenInputFromItems();
        renderPreviews();
      });

      previewsContainer.appendChild(div);
    });
  }

  fileInput.addEventListener('change', async () => {
    const files = fileInput.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    fileInput.value = '';

    for (let i = 0; i < filesArray.length; i++) {
      let file = filesArray[i];
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|avi)$/i.test(file.name);
      
      if (isVideo && !options.isVideoSupported) {
        alert('Videos are not supported for this field.');
        continue;
      }

      const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);

      if (file.type.startsWith('image/') && !isGif) {
        const cropModal = (window as any).cropModalInstance;
        if (cropModal) {
          const cropped = await cropModal.crop(file, { aspectRatio: options.aspectRatio ?? NaN });
          if (cropped === null) {
            continue; // Cancelled
          }
          file = cropped;
        }
      }

      if (options.isMultiple) {
        items.push({ type: 'local', val: file });
      } else {
        items.forEach(it => {
          if (it.type === 'uploaded') {
            removedPublicIds.push(it.val as string);
          }
        });
        items = [{ type: 'local', val: file }];
      }
    }

    syncHiddenInputFromItems();
    renderPreviews();
  });

  hiddenInput.addEventListener('input', () => {
    const hasLocal = items.some(it => it.type === 'local');
    if (!hasLocal) {
      initItems();
      renderPreviews();
    }
  });

  const processUploads = async () => {
    const hasLocalUploads = items.some(item => item.type === 'local');
    if (!hasLocalUploads && removedPublicIds.length === 0) {
      const finalVal = items.filter(item => item.type === 'uploaded').map(item => item.val as string);
      hiddenInput.value = options.isMultiple ? finalVal.join(',') : (finalVal[0] || '');
      return;
    }

    if (progressContainer) {
      progressContainer.classList.remove('hidden');
      if (progressStatus) progressStatus.textContent = 'Saving...';
      if (progressBar) progressBar.style.width = '20%';
      if (progressPercent) progressPercent.textContent = '20%';
    }

    // 1. Upload local files
    const localItems = items.filter(item => item.type === 'local');
    const totalLocal = localItems.length;
    
    for (let i = 0; i < totalLocal; i++) {
      const item = localItems[i];
      if (progressStatus) progressStatus.textContent = `Uploading file ${i + 1} of ${totalLocal}...`;
      const startPct = Math.round((i / totalLocal) * 80);
      if (progressBar) progressBar.style.width = `${startPct}%`;
      if (progressPercent) progressPercent.textContent = `${startPct}%`;

      const uploadedId = await fileManager.upload(
        item.val as File, 
        options.folder,
        (filePercent) => {
          const currentPct = Math.round(((i + filePercent / 100) / totalLocal) * 80);
          if (progressBar) progressBar.style.width = `${currentPct}%`;
          if (progressPercent) progressPercent.textContent = `${currentPct}%`;
        }
      );
      item.type = 'uploaded';
      item.val = uploadedId;
    }

    // 2. Remove deleted files from Cloudinary
    if (removedPublicIds.length > 0) {
      if (progressStatus) progressStatus.textContent = 'Removing deleted files...';
      if (progressBar) progressBar.style.width = '85%';
      if (progressPercent) progressPercent.textContent = '85%';
      
      await Promise.all(removedPublicIds.map(id => fileManager.remove(id)));
      removedPublicIds = [];
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressPercent) progressPercent.textContent = '100%';

    const finalVal = items.filter(item => item.type === 'uploaded').map(item => item.val as string);
    hiddenInput.value = options.isMultiple ? finalVal.join(',') : (finalVal[0] || '');
  };

  if (!options.manualSubmit) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await processUploads();
        form.submit();
      } catch (err: any) {
        alert('Error saving files: ' + err.message);
        if (progressContainer) progressContainer.classList.add('hidden');
      }
    });
  }

  initItems();
  renderPreviews();

  return {
    processUploads,
    getItems: () => items,
    getRemoved: () => removedPublicIds
  };
}

export function initAllDeferredUploadForms() {
  const forms = document.querySelectorAll('form[data-deferred-upload-form]');
  forms.forEach(formEl => {
    const form = formEl as HTMLFormElement;
    
    // Skip if already initialized to prevent double submission handlers
    if (form.getAttribute('data-deferred-upload-initialized') === 'true') {
      return;
    }
    form.setAttribute('data-deferred-upload-initialized', 'true');

    const pickers = form.querySelectorAll('input[type="file"][data-deferred-upload-picker]');
    if (pickers.length === 0) return;

    const controllers: any[] = [];

    pickers.forEach(pickerEl => {
      const picker = pickerEl as HTMLInputElement;
      const hiddenInputId = picker.getAttribute('data-hidden-input') || '';
      const previewsContainerId = picker.getAttribute('data-previews-container') || '';
      const folder = picker.getAttribute('data-folder') || '';
      const aspectRatio = parseFloat(picker.getAttribute('data-aspect-ratio') || 'NaN');
      const isVideoSupported = picker.getAttribute('data-video-supported') === 'true';
      const isMultiple = picker.getAttribute('data-multiple') === 'true' || picker.hasAttribute('multiple');
      const progressBarId = picker.getAttribute('data-progress-bar') || undefined;
      const progressContainerId = picker.getAttribute('data-progress-container') || undefined;
      const progressStatusId = picker.getAttribute('data-progress-status') || undefined;
      const progressPercentId = picker.getAttribute('data-progress-percent') || undefined;

      const controller = setupDeferredUploadForm({
        form,
        fileInput: picker,
        hiddenInput: hiddenInputId,
        previewsContainer: previewsContainerId,
        folder,
        aspectRatio,
        isVideoSupported,
        isMultiple,
        progressBarId,
        progressContainerId,
        progressStatusId,
        progressPercentId,
        manualSubmit: true
      });

      if (controller) {
        controllers.push(controller);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        // Run all controllers sequentially
        for (const controller of controllers) {
          await controller.processUploads();
        }
        form.submit();
      } catch (err: any) {
        alert('Error saving files: ' + err.message);
        // Hide progress containers on error
        pickers.forEach(pickerEl => {
          const containerId = pickerEl.getAttribute('data-progress-container');
          if (containerId) {
            const container = document.getElementById(containerId);
            if (container) container.classList.add('hidden');
          }
        });
      }
    });
  });
}

