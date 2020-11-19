/**
 * Class to display an Image element, maintaining its' aspect ratio
 */
class ImageField extends UIPanel{
		constructor(url){
			super();
			var t = this;
			if(url == null)
				url = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // Blank image
			t.landscape = true;
			t.addClass("imageField");
			t.setStyle("justifyContent", "center");
			t.image = DCE("img");
			t.image.src = url;
			t.lastSrc = url;
			t.element.appendChild(t.image);
			t.setResizePolicy();
		}
	
		calcSize(){
			super.calcSize();
			this.landscape = (this.element.clientWidth > this.element.clientHeight);
		}
	
		applySize(){
			super.applySize();
			this.setResizePolicy();
		}
	
		setSrc(src){
			if(this.lastSrc != src){
				this.image.src = src;
				this.lastSrc = src;
			}
		}
	
		setResizePolicy(){
			var t = this;
			if(t.landscape != t._pLandscape){
				var is = t.image.style;
				if(t.landscape){
					is.height = "100%";
					is.width = "auto";
					t.setStyle("flexDirection", "row");
				} else {
					is.height = "auto";
					is.width = "100%";
					t.setStyle("flexDirection", "column");
				}
			}
			t._pLandscape = t.landscape;
		}
	}