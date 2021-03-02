export class Upload {
  constructor({
    inputSelector,
    previewContainerSelector,
    multi,
    accept,
    onDownload = () => {},
  }) {
    this.multi = multi;
    this.accept = accept;
    this.onDownload = onDownload;
    this.input = document.querySelector(inputSelector);
    this.previewContainerWrap = document.querySelector(
      previewContainerSelector
    );
    this.openButton = this.createNode({
      element: "button",
      classes: ["btn"],
      content: "Открыть",
    });
    this.downloadButton = this.createNode({
      element: "button",
      classes: ["btn", "primary", "download"],
      content: "Загрузить",
    });
    this.preview = this.createNode({ classes: ["previewContainer"] });
    this.filesArray = [];
    this.uploadInit();
  }

  uploadInit = () => {
    if (this.multi) {
      this.input.setAttribute("multiple", true);
    }

    if (this.accept && Array.isArray(this.accept)) {
      this.input.setAttribute("multiple", this.accept.join(","));
    }

    this.previewContainerWrap.insertAdjacentElement("beforeend", this.preview);
    this.input.insertAdjacentElement("afterend", this.downloadButton);
    this.input.insertAdjacentElement("afterend", this.openButton);

    this.openButton.addEventListener("click", this.triggerInput);
    this.downloadButton.addEventListener("click", this.downloadHandler);
    this.input.addEventListener("change", this.changeHandler);
  };

  createNode = ({ element = "div", classes = [], content = "" }) => {
    const item = document.createElement(element);
    item.className = classes.join(" ");
    item.textContent = content;

    return item;
  };

  bytesToSize = bytes => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  getPreviewTamplate = ({
    src,
    name,
    size,
  }) => `<div class="previewBlock" data-name=${name}>
    <div class="closePreview">&#215;</div>  
    <img src="${src}"/>
    <div class="previewInfo">
      <span>${name}</span>
      <span>${this.bytesToSize(size)}</span>
    </div>
  </div>`;

  triggerInput = () => this.input.click();

  changeHandler = e => {
    if (!e.target.files.length) return;
    const { files } = e.target;
    this.filesArray = Array.from(files);

    this.preview.innerHTML = "";
    this.downloadButton.style.display = "inline-block";
    e.target.value = "";
    this.preview.addEventListener("click", this.previewClickhandler);

    this.filesArray.forEach(file => {
      const { name, size } = file;
      if (!file.type.match("image")) return;

      const reader = new FileReader();
      const loadHandler = ({ target: { result } }) => {
        this.preview.insertAdjacentHTML(
          "afterbegin",
          this.getPreviewTamplate({ src: result, name, size })
        );
      };

      reader.addEventListener("load", loadHandler);
      reader.readAsDataURL(file);
    });
  };

  previewClickhandler = ({ target }) => {
    if (!target.classList.contains("closePreview")) return;
    const previewBlock = target.closest(`.previewBlock`);
    previewBlock.classList.add("removing");

    previewBlock.addEventListener("transitionend", e =>
      this.previewRemovehandler(e)
    );
  };

  previewRemovehandler = ({ currentTarget }) => {
    currentTarget.remove();
    this.filesArray = this.filesArray.filter(
      item => item.name !== currentTarget.dataset.name
    );
    if (!this.filesArray.length) this.downloadButton.style.display = "none";
  };

  getPreviewStatusBar = item => {
    const infoPanel = item.querySelector(".previewInfo");
    const closePreview = item.querySelector(".closePreview");

    closePreview.style.display = "none";
    infoPanel.innerHTML = '<div class="previewInfoUpload"></div>';
    infoPanel.classList.add("previewInfoWithouthover");
  };

  downloadHandler = () => {
    this.downloadButton.style.display = "none";
    const remainingPreviews = [
      ...this.preview.querySelectorAll(".previewBlock"),
    ].filter(item => !item.classList.contains("removing"));

    remainingPreviews.forEach(this.getPreviewStatusBar);
    this.onDownload({
      files: this.filesArray,
      preview: this.preview,
      previews: remainingPreviews,
    });
  };
}
