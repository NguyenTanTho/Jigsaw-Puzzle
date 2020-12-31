document.addEventListener('DOMContentLoaded',function(){

    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
          thisArg = thisArg || window;
          for (let i = 0; i < this.length; i++) {
              callback.call(thisArg, this[i], i, this);
          }
      };
    }

    this.Puzzle = function(opts) {
        const instance = this;
        this.container = null;
        this.fullImg = new Image();
        this.grid = null;
        this.key = null;
        this.mouseX = null;
        this.mouseY = null;
        this.offsetX = null;
        this.offsetY = null;
        this.touchSlot = null;
        this.clientX = null;
        this.clientY = null;
        this.clientX = null;
        this.clientY = null;
        this.lastPlace = null;
        this.gridSize = null;
        this.usropts = opts;
        this.difficulty = null;
        this.settings = {
            el             : null,
            image          : 'https://i.pinimg.com/564x/8a/d4/b1/8ad4b1547ff0640da79c1ccc450bb39a.jpg',
            fullImg        : null,
            numcolumns     : 3,
            numrows        : 3,
            difficulty     : "normal",
            dragstart      : function(){},
            dragenter      : function(){},
            drag           : function(){},
            dragover       : function(){},
            dragleave      : function(){},
            dragend        : function(){},
            drop           : function(){},
            touchstart     : function(){},
            touchmove      : function(){},
            touchhover     : function(){},
            touchend       : function(){},
            mousedown      : function(){},
            mouseup        : function(){},
            correct        : function(){},
            finished       : function(){},
            debug          : false
        };

        this.init = function() {
            instance.setOpts(instance.usropts);
            instance.setDifficulty(instance.settings.difficulty);

            // set container
            if (instance.settings.el) {
                instance.container = instance.settings.el; 
            } else {
                console.error('No "el" option detected. Please specify an element to attach puzzle to.');
                return false;
            }


            let img = new Image();
            let width,height;
            img.onload = function() {
         
                if(this.height > window.innerHeight) {
                    height = window.innerHeight;
                    width = height * (this.width/this.height);
                } else {
                    width = this.width;
                    height = this.height;
                }

              
                instance.settings.width = width;
                instance.settings.height = height;

                
                instance.grid = buildGrid(instance.settings.numcolumns,instance.settings.numrows);
                instance.correctTiles();
                instance.container.innerHTML = "";
                instance.container.appendChild(instance.grid,instance.container.children[0]);
                setFrameDimensions(instance.grid,instance.container);
                setEventHandlers();
            };
            img.src = instance.settings.image;

            return instance;
        };

        this.setOpts = function() {
            
            Object.keys(instance.usropts).forEach(function(key) {
                (instance.settings[key] !== (undefined || null || '')) ? instance.settings[key] = instance.usropts[key] : ''; 
            });

            return instance;
        };

        this.setDifficulty = function(difficulty) {
            switch(difficulty) {
                case "easy":
                    instance.difficulty = .25;
                    break;

                case "normal":
                    instance.difficulty = .50;
                    break;

                case "hard":
                    instance.difficulty = .75;
                    break;
                    
                case "expert":
                    instance.difficulty = 1;
                    break;

                default:
                    instance.difficulty = .50;  
            }

            instance.usropts.difficulty = difficulty;

            return instance;
        };

        this.setGridSize = function(obj) {
            Object.keys(obj).forEach(function(value){
                if (value === "numrows" && typeof Number(obj[value]) == "number") {
                    instance.usropts.numrows = obj[value];
                }

                if (value === "numcolumns" && typeof Number(obj[value]) == "number") {
                    instance.usropts.numcolumns = obj[value];
                }
            });
            
            return instance;
        };

        this.setImage = function(src) {
            let tmpImg = new Image();
            tmpImg.onload = function() {
                instance.usropts.image = src;
            };
            tmpImg.src = src;

            return instance;
        };

        this.isSorted = function(array) {
            array = (array) ? array : instance.getTiles();
            let i = 0;
            let keys = Object.keys(array);
            let totalelements = array.length;

            while (totalelements > 1) {
                
                if (Number(keys[i]) === Number(array[i][0])) {
                    i++;
                    totalelements--;
                } else {
                    return false;
                }
            }

            return true;
        };

        this.getTiles = function() {
            let array=[];

            instance.grid.childNodes.forEach(function(child,index){
                if(child.nodeType !== 3) {
                    let arr = [];
                    arr[0] = Number(child.children[0].dataset.position) - 1;
                    arr[1] = child;
                    array[index] = arr;
                }
            });

            return array;
        };

        this.correctTiles = function(array) {

            array = (array) ? array : instance.getTiles();
            let i = 0;
            let keys = Object.keys(array);
            let totalelements = array.length;
            let number_correct = 0;

            while (totalelements > 0) {
               
                if (Number(keys[i]) === Number(array[i][0])) {
                    array[i][1].style.pointerEvents = "none";
                    array[i][1].dataset.inplace = "true";
                    number_correct++;
                } else {
                    array[i][1].children[0].dataset.inplace = '';
                    array[i][1].style.pointerEvents = "";
                }

                i++;
                totalelements--;
            }

            return number_correct;
        };

        
        function setEventHandlers() {
            let slots = instance.grid.children;

            
            document.addEventListener('dragover',function(evt){
                instance.mouseX = evt.clientX;
                instance.mouseY = evt.clientY;
            });

            
            document.addEventListener('mousemove',function(evt){
                instance.mouseX = evt.clientX;
                instance.mouseY = evt.clientY;
            });

           
            document.addEventListener('transitionend',function(evt){
                evt.target.classList.remove('animate');
            });

            
            document.addEventListener('touchmove', function(evt) {
                if (instance.touchSlot) {
                    if( evt.touches[0].clientY > instance.offsetY &&
                        evt.touches[0].clientX > instance.offsetX &&
                        evt.touches[0].clientY < document.body.offsetHeight - (instance.touchSlot.offsetHeight - instance.offsetY) &&
                        evt.touches[0].clientX < document.body.offsetWidth - (instance.touchSlot.offsetWidth - instance.offsetX)) {

                        
                        instance.touchSlot.style.zIndex = 10;
                        instance.touchSlot.style.pointerEvents = "none";
                        instance.touchSlot.style.transform = "translate(" + (evt.touches[0].clientX - instance.clientX) + "px," + (evt.touches[0].clientY - instance.clientY) + "px" + ")";

                        let params = {
                            self : instance,
                            event : evt,
                            target : evt.target
                        };

                        
                        Object.keys(slots).forEach(function(index) {
                            let top = slots[index].getBoundingClientRect().top;
                            let bottom = slots[index].getBoundingClientRect().bottom;
                            let right = slots[index].getBoundingClientRect().right;
                            let left = slots[index].getBoundingClientRect().left;

                            
                            if ( evt.touches[0].clientX > left &&
                                 evt.touches[0].clientX < right &&
                                 evt.touches[0].clientY > top &&
                                 evt.touches[0].clientY < bottom &&
                                 slots[index] !== instance.touchSlot ) {

                                if (!slots[index].style.pointerEvents) {
                                    
                                    Object.keys(instance.grid.children).forEach(function(key) {
                                        instance.grid.children[key].classList.remove('highlight');
                                    });

                                    slots[index].classList.add('highlight');
                                }

                                
                                if( instance.settings.touchhover
                                    && typeof instance.settings.touchhover === "function") {
                                    instance.settings.touchhover(params);
                                }
                            }

                            instance.clientX = evt.touches[0].clientX;
                            instance.clientY = evt.touches[0].clientY;
                        });
                    }
                }
            });

            Object.keys(slots).forEach(function(index) {
                let isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

                
                slots[index].addEventListener('mousemove', function(evt){
                    instance.offsetX = evt.offsetX;
                    instance.offsetY = evt.offsetY;
                    instance.clientX = evt.clientX;
                    instance.clientY = evt.clientY;

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.mousemove
                        && typeof instance.settings.mousemove === "function") {
                        instance.settings.mousemove(params);
                    }
                });

                

                slots[index].addEventListener('mousedown', function(evt) {
                    
                    this.draggable = true;
                    
                    
                    addAfterImage(this);

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.mousedown
                        && typeof instance.settings.mousedown === "function") {
                        instance.settings.mousedown(params);
                    }
                });

                slots[index].addEventListener('mouseup', function(evt){
                    this.style.transform = "";
                    this.removeAttribute('draggable');

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                   
                    if( instance.settings.mouseup
                        && typeof instance.settings.mouseup === "function") {
                        instance.settings.mouseup(params);
                    }
                });
                
                

                slots[index].addEventListener('dragstart',function(evt){
                    let dt = evt.dataTransfer;

                    if (isIE11) {
                        
                    } else {    
                        dt.setDragImage(new Image(),0,0); 
                        dt.setData('key',''); 
                    }

                    
                    instance.key = index;

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.dragstart
                        && typeof instance.settings.dragstart === "function") {
                        instance.settings.dragstart(params);
                    }
                });

                slots[index].addEventListener('drag', function(evt) {
                    let x;
                    let y;
                    
                    let mouseX = instance.mouseX;
                    let mouseY = instance.mouseY;
                    let offsetX = instance.offsetX;
                    let offsetY = instance.offsetY;
                    let clientX = instance.clientX;
                    let clientY = instance.clientY;
                    
                    let topBorder = mouseY < offsetY;
                    let leftBorder = mouseX < offsetX;
                    let rightBorder = mouseX > document.body.offsetWidth - (evt.target.offsetWidth - offsetX);
                    let bottomBorder = mouseY > document.body.offsetHeight - (evt.target.offsetHeight - offsetY);
                    
                    if( !leftBorder && !topBorder && !rightBorder && !bottomBorder) {
                        evt.target.style.zIndex = 10;
                        evt.target.style.pointerEvents = "none";
                        x = mouseX - clientX;
                        y = mouseY - clientY;
                        evt.target.style.transform = "translate(" + x + "px," + y + "px)";
                    }

                   
                    if (topBorder && !rightBorder && !leftBorder) {
                        x = mouseX - clientX;
                        y = clientY - offsetY;
                        evt.target.style.transform = "translate(" + x + "px," + -y + "px)";
                    }

                    
                    if (bottomBorder && !rightBorder && !leftBorder) {
                        x = mouseX - clientX;
                        y = document.body.offsetHeight - (clientY + (evt.target.offsetHeight - offsetY));
                        evt.target.style.transform = "translate(" + x + "px," + y + "px)";
                    }

                    
                    if (leftBorder && !bottomBorder && !topBorder) {
                        x = clientX - offsetX;
                        y = mouseY - clientY;
                        evt.target.style.transform = "translate(" + -x + "px," + y + "px)";
                    } else if (leftBorder && bottomBorder) {
                        x = clientX - offsetX;
                        y = document.body.offsetHeight - (clientY + (evt.target.offsetHeight - offsetY));
                        evt.target.style.transform = "translate(" + -x + "px," + y + "px)";
                    } else if (leftBorder && topBorder) {
                        x = clientX - offsetX;
                        y = clientY - offsetY;
                        evt.target.style.transform = "translate(" + -x + "px," + -y + "px)";
                    }

                    
                    if (rightBorder && !bottomBorder && !topBorder) {
                        x = document.body.offsetWidth - (clientX + (evt.target.offsetWidth - offsetX));
                        y = mouseY - clientY;
                        evt.target.style.transform = "translate(" + x + "px," + y + "px)";
                    } else if (rightBorder && topBorder) {
                        x = document.body.offsetWidth - (clientX + (evt.target.offsetWidth - offsetX));
                        y = clientY - offsetY;
                        evt.target.style.transform = "translate(" + x + "px," + -y + "px)";
                    } else if (rightBorder && bottomBorder) {
                        x = document.body.offsetWidth - (clientX + (evt.target.offsetWidth - offsetX));
                        y = document.body.offsetHeight - (clientY + (evt.target.offsetHeight - offsetY));
                        evt.target.style.transform = "translate(" + x + "px," + y + "px)";
                    }

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.drag
                        && typeof instance.settings.drag === "function") {
                        instance.settings.drag(params);
                    }
                });

                slots[index].addEventListener('dragend', function(evt){
                    
                    if (!evt.target.dataset.inplace) {
                        
                        evt.target.style.pointerEvents = "";
                    }

                   
                    setTimeout(function(){
                        evt.target.classList.add('animate');
                        evt.target.style.transform = "translate(0px,0px)";
                    }, 100);

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.dragend
                        && typeof instance.settings.dragend === "function") {
                        instance.settings.dragend(params);
                    }
                });

                

                slots[index].addEventListener('dragenter', function(evt) {
                    evt.preventDefault(); 

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    if( instance.settings.dragenter
                        && typeof instance.settings.dragenter === "function") {
                        instance.settings.dragenter(params);
                    }
                });

                slots[index].addEventListener('dragover', function(evt) {
                    evt.preventDefault(); 
                    
                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    if( instance.settings.dragover
                        && typeof instance.settings.dragover === "function") {
                        instance.settings.dragover(params);
                    }
                });

                slots[index].addEventListener('dragleave',function(evt) {
                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.dragleave
                        && typeof instance.settings.dragleave === "function") {
                        instance.settings.dragleave(params);
                    }
                });

                slots[index].addEventListener('drop', function(evt) {
                    let slot = this;
                    let dragSlot = slots[instance.key];
                    let tile = slots[index].children[0];
                    let dragTile = dragSlot.children[0];

                    
                    dragTile.classList.remove('highlight');
                    slots[index].classList.remove('highlight');

                    
                    dragSlot.removeAttribute('draggable');
                    slots[index].removeAttribute('draggable');

                    
                    dragSlot.style.zIndex = 10;
                    instance.lastPlace.remove();

                    
                    slots[index].appendChild(dragTile);
                    dragSlot.appendChild(tile);

                   
                    instance.correctTiles();

                    
                    runCallBacks(slot,dragSlot,tile,dragTile,evt);

                    // debug output
                    if (instance.settings.debug) {
                        console.info(instance);
                        console.info(tile[0]);
                        console.info(slot);
                        console.info("Dropped tile #" + (Number(tile[0].dataset.position)) + " in slot #" + (Array.from(instance.grid.children).indexOf(slot) + 1));
                    }
                });

                

                slots[index].addEventListener('touchstart', function(evt) {
                    instance.touchSlot = evt.target;
                    instance.offsetY = Math.round(evt.touches[0].clientY - evt.target.getBoundingClientRect().top);
                    instance.offsetX = Math.round(evt.touches[0].clientX - evt.target.getBoundingClientRect().left);
                    instance.clientX = evt.touches[0].clientX;
                    instance.clientY = evt.touches[0].clientY;

                    this.children[0].classList.add('highlight');

                    
                    addAfterImage(this);

                    this.style.zIndex = 10;
                    instance.touchSlot = this;

                    let params = {
                        self : instance,
                        event : evt,
                        target : evt.target
                    };

                    
                    if( instance.settings.touchstart
                        && typeof instance.settings.touchstart === "function") {
                        instance.settings.touchstart(params);
                    }
                });

                slots[index].addEventListener('touchend', function(evt) {

                    evt.target.style.pointerEvents = "";
                    instance.grid.querySelectorAll('.highlight').forEach(function(el){el.classList.remove('highlight')});
                    instance.lastPlace.remove();

                    setTimeout(function(){
                        evt.target.classList.add('animate');
                        evt.target.style.transform = "translate(0px,0px)";
                    },100);

                    Object.keys(slots).forEach(function(index) {
                        let top = slots[index].getBoundingClientRect().top;
                        let bottom = slots[index].getBoundingClientRect().bottom;
                        let right = slots[index].getBoundingClientRect().right;
                        let left = slots[index].getBoundingClientRect().left;

                        if ( instance.clientX > left &&
                             instance.clientX < right &&
                             instance.clientY > top &&
                             instance.clientY < bottom &&
                             slots[index] !== instance.touchSlot &&
                             !slots[index].style.pointerEvents ) {

                            let slot = slots[index];
                            let dragSlot = evt.target;
                            let tile = slot.children[0];
                            let dragTile = dragSlot.children[0];

                            
                            dragTile.classList.remove('highlight');
                            slot.classList.remove('highlight');

                            
                            dragSlot.removeAttribute('draggable');
                            slot.removeAttribute('draggable');

                            
                            dragSlot.style.zIndex = 10;

                            
                            slot.appendChild(dragTile);
                            dragSlot.appendChild(tile);

                            
                            instance.correctTiles();

                            
                            runCallBacks(slot,dragSlot,tile,dragTile,evt);
                            
                            if (!slots[index].draggable) {
                                
                                Object.keys(instance.grid.children).forEach(function(key) {
                                    instance.grid.children[key].classList.remove('highlight');
                                });
                            }
                        }
                    });

                    
                    instance.touchSlot = null;
                });

                

                slots[index].addEventListener('transitionend', function(evt) {
                    
                    if (evt.target.style.transform === "translate(0px, 0px)") {
                        if(instance.lastPlace !== undefined) {
                            instance.lastPlace.remove();
                        }
                        this.children[0].classList.remove('highlight');
                        this.style.zIndex = "";
                        this.style.transform = "";
                    }
                });
            });

            window.addEventListener('resize',function() {
                setFrameDimensions(instance.grid,instance.container);
            });
        }

        function addAfterImage(el) {
            if (instance.lastPlace) {
                instance.lastPlace.remove();
            }

            instance.lastPlace = el.cloneNode(true);

            Object.assign(instance.lastPlace.style, {
                'position':'absolute',
                'opacity':'.4',
                'top': (el.getBoundingClientRect().top - el.parentNode.getBoundingClientRect().top) + "px",
                'left': (el.getBoundingClientRect().left - el.parentNode.getBoundingClientRect().left) + "px",
                'zIndex':'-2'
            });

            el.parentNode.appendChild(instance.lastPlace);
        }

        function runCallBacks(slot,dragSlot,tile,dragTile,evt) {
            let tileInPlace = 
            (Array.from(instance.grid.children).indexOf(slot) === Number(tile.dataset.position) - 1);
            let prevTileInPlace = 
            (Array.from(instance.grid.children).indexOf(dragSlot.parentNode) === Number(dragTile.dataset.position) - 1);
            let params = 
            {
                self: instance,
                event : evt,
                target : evt.target,
                dropped: 
                {
                    el: tile,
                    position: tile.dataset.position,
                    inPlace: tileInPlace
                },
                dragged: 
                {
                    el: dragTile,
                    position: dragTile.dataset.position,
                    inPlace: prevTileInPlace
                }
            };

            
            if( instance.settings.drop
                && typeof instance.settings.drop === "function") {
                instance.settings.drop(params);
            }

            
            if (instance.isSorted(instance.getTiles())) {
                
                
                instance.grid.appendChild(instance.fullImg);

                
                if( instance.settings.finished 
                    && typeof instance.settings.finished === "function") {
                    instance.settings.finished(params);
                }
            }

            
            if (tileInPlace || prevTileInPlace) {
                
                if( instance.settings.correct 
                    && typeof instance.settings.correct === "function") {
                    instance.settings.correct(params);
                }
            }
        }

        function setFrameDimensions(grid,container) {
            let containerWidth = container.offsetWidth;

            
            let padding = 0;
            let paddingArr = [
                window.getComputedStyle(container).paddingRight,
                window.getComputedStyle(container).paddingLeft
            ];
            paddingArr.forEach(function(value) {
                padding += parseInt(value);
            });

            
            containerWidth = containerWidth - padding;

            Object.assign(grid.style,{
                'max-width'  : instance.settings.width + 'px',
                'max-height' : instance.settings.height + 'px',
                'height'     : 'calc(' + containerWidth + "px * " + "(" + instance.settings.height + "/" + instance.settings.width + ")" +')'
            });
        }

        function buildGrid(numcolumns,numrows) {
            let gridArr = [];
            let i = 0;
            let currentRow = 0;
            let currentColumn = 1;
            instance.grid = document.createElement('ul');
            instance.gridSize = numcolumns * numrows;

            while(i<instance.gridSize) {
                // build html
                let tmpLi = document.createElement('li');
                let tmpDiv = document.createElement('div');
                let tmpImg = document.createElement('img');
                let tmpArr = [];

                Object.assign(tmpLi.style,{
                    'height'    : (100/numrows)+'%',
                    'max-width' : (100/numcolumns)+'%',
                    'flex'      : '1 0 '+(100/numcolumns)+'%'
                });

                tmpDiv.dataset.position = i+1;
                
                tmpImg.src = instance.settings.image;
                tmpImg.style.position = "relative";
                tmpImg.style.width = 100*numcolumns+"%";

                
                if(((i+1)%(Math.floor(instance.gridSize/numrows)))===0) {
                    tmpImg.style.top = -(100*currentRow)+"%";
                    currentRow++;
                } else {
                    tmpImg.style.top = -(100*currentRow)+"%";
                }

                
                if((i)%numcolumns !== 0) {
                    tmpImg.style.left = -(100*currentColumn) + "%";
                    currentColumn++;
                } else {
                    currentColumn = 1;
                }

               
                tmpDiv.appendChild(tmpImg);
                tmpLi.appendChild(tmpDiv);
                tmpArr[0] = i; 
                tmpArr[1] = tmpLi;
                gridArr.push(tmpArr);
                i++;
            }

            instance.grid.classList.add("frame");
            instance.grid.classList.add("no-select");

            gridArr = shuffleArr(gridArr);
            gridArr.forEach(function(piece) {
                instance.grid.appendChild(piece[1]);
            });

            instance.fullImg.src = (instance.settings.fullImg) ? instance.settings.fullImg : instance.settings.image;
            instance.fullImg.classList.add('full-img');
            instance.fullImg.style.opacity = 0;
            instance.fullImg.style.zIndex = -1;

            return instance.grid;
        }

        function shuffleArr(array) {
            let shuffle_limit = array.length - Math.ceil(array.length * instance.difficulty);
            let m = array.length, t, i;

            
            shuffle_limit = (shuffle_limit < (m - 1)) ? shuffle_limit : 0;

            
            m = (m - shuffle_limit > 0) ? m - Math.abs(shuffle_limit) : 2;

            
            while (m) {

                
                i = Math.floor(Math.random() * (m-1)+1);

                if (m<0) {
                    break;
                } else {
                    m--;
                }

                
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }

            
            if(instance.isSorted(array)) {
                shuffleArr(array);
            }

           
            if(instance.difficulty === 1 && instance.correctTiles(array)) {
                array.forEach(function(arr){
                    arr[1].dataset.inplace = "";
                });
                shuffleArr(array);
            }

            return array;
        }

        return this;
    }
}());