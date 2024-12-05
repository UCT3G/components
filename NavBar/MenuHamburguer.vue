<template>
  <div class="hamburguer-contenedor" @click="toggleMenu">
    <div class="hamburguer-fondo"></div>
    <div class="quick-menu" ref="quickMenu" :style="quickMenuStyle" >
      
      <div v-for="(n, key) in menuCount" :key="key" class="sub-menu" :style="getSubMenu(n-1)">

          <router-link v-if="menuUrlList[n-1].isLink" :to="menuUrlList[n-1].url" :target="openNewTab" :style="subMenuStyle" @mouseover.stop="mouseEnterSubMenu" @mouseout.stop="mouseOutSubMenu">
            <i :class="iconClass[n-1]" ref="icon"></i>
          </router-link>

          <a v-else :style="subMenuStyle" @mouseover.stop="mouseEnterSubMenu" @mouseout.stop="mouseOutSubMenu" @click="processCallback(key)">
            <!--<i :class="iconClass[n-1]" ref="icon"></i>-->
            <!--<img :src="iconClass[n-1]" ref="icon"  alt="icono" class="hamburguer-imgicon">-->
            <DynamicSvgLoader ref="icon"  alt="icono"  class="hamburguer-imgicon"  width_icon="22px" :fileName="iconClassDir[n-1]"></DynamicSvgLoader>
          </a>

        </div>

        <div class='menu' :style="menuStyle">
          <div class='core-menu' >
            <div class='bar'></div>
          </div>
        </div>
    </div>
  </div>
</template>
<script>

  import DynamicSvgLoader from '@/components/LoaderSVG/LoaderSVG.vue';
 

	export default{
        name:'quickMenu',
        components: {
          DynamicSvgLoader
        },
        props: {
            menuCount: {
                type: Number,
                default: 3 // Ya está correctamente establecido
            },
            iconClass: {
                type: Array,
                //default: () => ["fa fa-github", "fa fa-comment", "fa fa-code", "fa fa-envelope"]
                default: () => []//[person_fill, bell, logout] // Proporciona los valores predeterminados como una función que retorna un array
            },
            iconClassDir: {
                type: Array,
                //default: () => ["fa fa-github", "fa fa-comment", "fa fa-code", "fa fa-envelope"]
                default: () => ['icons/USUARIO-04', 'icons/NOTI-04', 'icons/SALIR-04'] // Proporciona los valores predeterminados como una función que retorna un array
            },
            menuUrlList: {
                type: Array,
                default: () => [
                    {'isLink': false},
                    {'isLink': false},                    
                    {'isLink': false}
                ] // Igual que iconClass, usa una función que retorna un array {'isLink': true, url: "/foo"},
            },
            backgroundColor: {
                type: String,
                default: 'rgba(241, 245, 253, .0)' 
            },
            color: {
                type: String,
                default: '#f1f5fd' 
            },
            isOpenNewTab: {
                type: Boolean,
                default: false 
            },
            position: {
                type: String,
                default: 'top-right' 
            }
        },

        computed:{
            openNewTab(){
            return this.isOpenNewTab?'_blank':'_self'
            },
            quickMenuStyle(){
            const topPosition = {top:'0px'}, 
            bottomPosition={bottom:'30px'},
            leftPosition = {left:'30px'},
            rightPosition = {right:'0px'}

            let style = this.isTop?topPosition:bottomPosition
            Object.assign(style, this.isLeft?leftPosition:rightPosition)
            Object.assign(style,{transform: this.isLeft?"rotate(-180deg)":"rotate(180deg)"})
            return style
            },
            menuStyle(){
            return {
                backgroundColor: this.backgroundColor,
                color: this.color
            }
            },
            subMenuStyle(){
            const style = {
                backgroundColor: this.backgroundColor,
                color: this.color
            }
            return style
            },
        
            isTop(){
            return !!~this.position.toLowerCase().indexOf('top')
            },
            isLeft(){
            return !!~this.position.toLowerCase().indexOf('left')
            }
        },
        data(){
            return{
            menuSize:60,
            subMenu4:[[["0","-160"],["-80","-138.6"],["-138.6","-80"],["-160","0"]],[["0","-160"],["80", "-138.6"],["138.6","-80"],["160","0"]],[["0","160"],["138.6","80"],["80","138.6"],["160","0"]],[["-160","0"],["-138.6","80"],["-80","138.6"],["0","160"]]],
            subMenu3:[[["-160","0"],["-113","-113"],["0","-160"]],[["0","-160"],["113","-113"],["160","0"]],[["0","160"],["113","113"],["160","0"]],[["-160","0"],["-113","113"],["0","160"]]],
            subMenu2:[[["-160","0"],["0","-160"]],[["0","-160"],["160","0"]],[["0","160"],["160","0"]],[["-160","0"],["0","160"]]]
            }
        },
        methods:{
            getSubMenu(n){
            let menuPosition = this.menuCount===4?this.subMenu4:this.menuCount===3?this.subMenu3:this.subMenu2
            menuPosition = this.isTop&&this.isLeft?menuPosition[2]:this.isTop&&!this.isLeft?menuPosition[1]:!this.isTop&&this.isLeft?menuPosition[3]:menuPosition[0]
            return {top:menuPosition[n][0]+'px',left:menuPosition[n][1]+'px'}
            },
            toggleMenu() {
                let menuEl = this.$refs.quickMenu;
                let menuIconEl = this.$refs.icon;
                let hamburguerContenedor = this.$el; // Hace referencia al div con la clase hamburguer-contenedor
                
                // Si no contiene la clase 'active', la agregamos junto con 'hamburguer-active'
                if (menuEl != null){
                  if (!~menuEl.className.indexOf(' active')) {
                    menuEl.className += ' active';
                    hamburguerContenedor.classList.add('hamburguer-active'); // Agregamos la clase hamburguer-active
                    
                    menuIconEl.forEach(function (element) {
                        element.className += ' menu-animate';
                    });
                  } else {
                      // Si ya está activa, removemos las clases
                      menuEl.className = menuEl.className.replace(' active', '');
                      setTimeout(() => {
                        hamburguerContenedor.classList.remove('hamburguer-active'); // Removemos la clase hamburguer-active
                      }, 500);
                      menuIconEl.forEach(function (element) {
                          element.className = element.className.replace(' menu-animate', '');
                      });
                  }
                }
                
            }
            ,
            processCallback(key){
            console.log("PROCESS CALL");
            console.log(key);
            this.$emit('process',key)
            },
            mouseEnterSubMenu(e){
            if(e.target.tagName==='A'){
                e.target.style.backgroundColor = this.lightenColor(this.backgroundColor, 20)
                // e.target.firstElementChild.style.backgroundColor = this.lightenColor(this.backgroundColor, 20)
            } else if(e.target.tagName==='I'){
                e.target.parentElement.style.backgroundColor = this.lightenColor(this.backgroundColor, 20)
                // e.target.style.backgroundColor = this.lightenColor(this.backgroundColor, 20)
            }
            
            },
            mouseOutSubMenu(e){
            if(e.target.tagName==='A'){
                e.target.style.backgroundColor = this.backgroundColor
                // e.target.firstElementChild.style.backgroundColor = this.backgroundColor
            }else if(e.target.tagName==='I'){
                e.target.parentElement.style.backgroundColor = this.backgroundColor
                // e.target.style.backgroundColor = this.backgroundColor
            }
            
            },
            lightenColor (hex, amt) {

            var usePound = false

            if (hex[0] === '#') {
                hex = hex.slice(1)
                usePound = true
            }

            var num = parseInt(hex, 16)
            var r = (num >> 16) + amt

            if (r > 255) r = 255
            else if (r < 0) r = 0

                var b = ((num >> 8) & 0x00FF) + amt

            if (b > 255) b = 255
            else if (b < 0) b = 0

            var g = (num & 0x0000FF) + amt

            if (g > 255) g = 255
            else if (g < 0) g = 0
            return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
            }
        }
	}
</script>

<style lang="less">
.hamburguer-contenedor{
  /*background-color: tomato;*/
  height: -moz-fit-content;
  height: 120px;
  width: -moz-min-content;
  width: 135px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  overflow: hidden;  
}

.hamburguer-active{
  height: -moz-fit-content;
  height: 250px;
  width: -moz-min-content;
  width: 250px;
}

.hamburguer-fondo{    
    width: 120px;
    height: 140px;
    background-color: var(--blueBerry);    
    position: absolute;
    top:-35px;
    right: -30px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
    border-radius: 25% 75% 39% 61% / 32% 54% 46% 68%;    
    background: linear-gradient(120deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%); 
    cursor: pointer;   
}
.hamburguer-imgicon{
 
  display: block;
  margin: 15px 19px;
  fill:var(--babyBlue);
}
.hamburguer-imgicon:nth-child(1){
  
  
  display: block!important;
  margin: auto!important;
  position: absolute!important;
  top: -5px;
  left: 10px;
  

}

@media (min-width: 1245px){
  .hamburguer-fondo{
    right: 5px;
  }
  .quick-menu{
      right: 28px!important;
  }
}
.menu-animate {
  -webkit-animation: bounce 1s linear 1s;
  -moz-animation: bounce 1s linear 1s;
  animation: bounce 1s linear 1s;
}
.quick-menu .sub-menu:nth-child(1),
.quick-menu .sub-menu:nth-child(1) a {
  border-radius: 25% 75% 39% 61% / 32% 54% 46% 68%!important;  
  background: linear-gradient(120deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  transition: .5s;
}

.quick-menu .sub-menu:nth-child(2),
.quick-menu .sub-menu:nth-child(2) a {
  border-radius: 44% 56% 39% 61% / 67% 54% 46% 33% !important;  
  background: linear-gradient(110deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  transition: .5s;
}

.quick-menu .sub-menu:nth-child(3),
.quick-menu .sub-menu:nth-child(3) a {
  border-radius: 75% 25% 39% 61% / 44% 54% 46% 56%  !important;  
  background: linear-gradient(100deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  transition: .5s;
}

.quick-menu .sub-menu:nth-child(4),
.quick-menu .sub-menu:nth-child(4) a {
  border-radius: 47% 53% 22% 78% / 44% 54% 46% 56%  !important;  
  background: linear-gradient(90deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.quick-menu .sub-menu:hover,
.quick-menu .sub-menu a:hover{
  border-radius: 34% 66% 40% 60% / 51% 32% 68% 49% !important;
  width: 70px !important;
}

.quick-menu {
  z-index: 10;
  color: #fff;
  position: fixed;
  position: absolute;
  width: 60px;
  height: 60px;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  transition: all 1s ease;
  right: 30px;
  
  > .menu {
    display: block;
    position: absolute;
    /*border-radius: 50% !important;*/
    width: 60px;
    height: 60px;
    text-align: center;
    /*box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);*/
    color: #fff;
    -webkit-transition: all 1s ease;
    -moz-transition: all 1s ease;
    transition: all 1s ease;
    .core-menu {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 60px;
      height: 60px;
      -webkit-transform: rotate(180deg);
      -moz-transform: rotate(180deg);
      -ms-transform: rotate(180deg);
      -o-transform: rotate(180deg);
      transform: rotate(180deg);
      -webkit-transition: all 1s ease;
      -moz-transition: all 1s ease;
      transition: all 1s ease;
      cursor: pointer;
      .bar {
        -webkit-transition: all 1s ease;
        -moz-transition: all 1s ease;
        transition: all 1s ease;
        width: 28px;
        height: 5px;
        border-radius: 5px;
        background: #454545;/**Barra1 */
        background: var(--babyBlue);
        position: absolute;
        top: 35%;
        margin-top: -1.5px;
        left: 16px;
        -webkit-transform-origin: 0% 50%;
        -moz-transform-origin: 0% 50%;
        -ms-transform-origin: 0% 50%;
        -o-transform-origin: 0% 50%;
        transform-origin: 0% 50%;
        &:before ,&:after{
          -webkit-transition: all 1s ease;
          -moz-transition: all 1s ease;
          transition: all 1s ease;
          content: '';
          width: 28px;
          height: 5px;
          border-radius: 5px;
          background: #454545;/**Barra2 y 3 */
          background: var(--babyBlue);
          position: absolute;
          left: 0px;
          -webkit-transform-origin: 0% 50%;
          -moz-transform-origin: 0% 50%;
          -ms-transform-origin: 0% 50%;
          -o-transform-origin: 0% 50%;
          transform-origin: 0% 50%;
        }
        &:before{
          margin-top: 35%;
        }
        &:after {
          margin-top: 70%;
        }
      }
    }
  }
  .sub-menu{
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    position: absolute;
    width: 60px;
    height: 60px;
    font-size: 30px;
    text-align: center;
    /*border-radius: 50% !important;*/
    background: var(--babyBlue);        
    /*background: linear-gradient(120deg,var(--blueBerry) 46%,var(--blueBerryLight) 100%);*/
    a{
      outline: none;
      text-decoration: none;
      display: inline-block;
      /*border-radius: 50% !important;*/
      width: 100%;
      height: 100%;
      i {
        outline: none;
        font-size:30px;
        margin-top:12px;
        background:transparent;
        &:before{
          vertical-align: middle;
        }
      }
      &:hover {
        cursor: pointer;
      }
    }
  }
  &.active{
    -webkit-transform: rotate(0deg)!important;
      -moz-transform: rotate(0deg)!important;
      -ms-transform: rotate(0deg)!important;
      -o-transform: rotate(0deg)!important;
      transform: rotate(0deg)!important;
      .menu{
        -webkit-transform: scale(0.7);
        -moz-transform: scale(0.7);
        -ms-transform: scale(0.7);
        -o-transform: scale(0.7);
        transform: scale(0.7);
        .bar {
          top: 50%;
          margin-top: -1.5px;
          left: 50%;
          margin-left: -12px;
          -webkit-transform-origin: 50% 50%;
          -moz-transform-origin: 50% 50%;
          -ms-transform-origin: 50% 50%;
          -o-transform-origin: 50% 50%;
          transform-origin: 50% 50%;
          -webkit-transform: rotate(405deg);
          -moz-transform: rotate(405deg);
          -ms-transform: rotate(405deg);
          -o-transform: rotate(405deg);
          transform: rotate(405deg);
              &:before {
                -webkit-transform-origin: 50% 50%;
                -moz-transform-origin: 50% 50%;
                -ms-transform-origin: 50% 50%;
                -o-transform-origin: 50% 50%;
                transform-origin: 50% 50%;
                -webkit-transform: rotate(-450deg);
                -moz-transform: rotate(-450deg);
                -ms-transform: rotate(-450deg);
                -o-transform: rotate(-450deg);
                transform: rotate(-450deg);
                margin-top: 0px;
              }
          &:after{
            opacity: 0;
          }
        }
      }
    }
}

@-webkit-keyframes bounce {
  0%,100% {
    -webkit-transform: translateY(0px);
  }
  10% {
    -webkit-transform: translateY(6px);
  }
  30% {
    -webkit-transform: translateY(-4px);
  }
  70% {
    -webkit-transform: translateY(3px);
  }
  90% {
    -webkit-transform: translateY(-2px);
  }
}
@-moz-keyframes bounce {
  0%,100% {
    -moz-transform: translateY(0px);
  }
  10% {
    -moz-transform: translateY(6px);
  }
  30% {
    -moz-transform: translateY(-4px);
  }
  70% {
    -moz-transform: translateY(3px);
  }
  90% {
    -moz-transform: translateY(-2px);
  }
}
@keyframes bounce {
  0%,100% {
    -webkit-transform: translateY(0px);
    -moz-transform: translateY(0px);
    -ms-transform: translateY(0px);
    -o-transform: translateY(0px);
    transform: translateY(0px);
  }
  10% {
    -webkit-transform: translateY(6px);
    -moz-transform: translateY(6px);
    -ms-transform: translateY(6px);
    -o-transform: translateY(6px);
    transform: translateY(6px);
  }
  30% {
    -webkit-transform: translateY(-4px);
    -moz-transform: translateY(-4px);
    -ms-transform: translateY(-4px);
    -o-transform: translateY(-4px);
    transform: translateY(-4px);
  }
  70% {
    -webkit-transform: translateY(3px);
    -moz-transform: translateY(3px);
    -ms-transform: translateY(3px);
    -o-transform: translateY(3px);
    transform: translateY(3px);
  }
  90% {
    -webkit-transform: translateY(-2px);
    -moz-transform: translateY(-2px);
    -ms-transform: translateY(-2px);
    -o-transform: translateY(-2px);
    transform: translateY(-2px);
  }
}
</style>