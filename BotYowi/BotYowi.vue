<template>
    <div class="BotYowiAvatar" :style="{ height: heightYowi, width: widthYowi }">
        <div
            v-for="(item, index) in mediaList"
            :key="item.id"
            :style="{ zIndex: index === mediaList.length - 1 ? 2 : 1, opacity: index === mediaList.length - 1 ? 1 : 0 }"
            class="media-container d-flex justify-content-center"
        >
            <img v-if="item.type === 'image'" :src="require('@/assets/images/' + item.src)" :alt="item.ref"/>
            <video v-else :src="require('@/assets/video/' + item.src)" autoplay muted playsinline loop>
                Tu navegador no soporta el elemento de video.
            </video>
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
    props: {
        heightYowi: {
            type: String,
            require: true
        },
        widthYowi: {
            type: String,
            require: true
        },
        multimedia: {
            type: Object,
            require: true
        },
        imagen: {
            type: Boolean,
            require: true
        },
        video: {
            type: Boolean,
            require: true
        }
    },
    name:'BotYowi',
    setup(props) {
        const mediaList = ref([
        {
            id: Date.now(), // Unique ID for each media item
            src: props.multimedia.src,
            ref: props.multimedia.ref,
            type: props.imagen ? 'image' : 'video'
        }
        ]);

        watch(() => props.multimedia, (newMedia) => {
            const newType = props.imagen ? 'image' : 'video';
            mediaList.value.push({
                id: Date.now(), // Ensure a unique ID for each new media item
                src: newMedia.src,
                ref: newMedia.ref,
                type: newType
            });

            setTimeout(() => {
                if (mediaList.value.length > 1) {
                    mediaList.value.shift();
                }
            }, 1000); // Match this duration with your CSS transition duration
        },{ deep: true });

        return {
            mediaList
        };
    }
}
</script>

<style>
@keyframes float {
    0% {
        box-shadow: 0 5px 15px 0 rgba(0,0,0,0.6);
        transform: translateY(0px);
    }
    50% {
        box-shadow: 0 25px 15px 0 rgba(0,0,0,0.2);
        transform: translateY(-20px);
    }
    100% {
        box-shadow: 0 5px 15px 0 rgba(0,0,0,0.6);
        transform: translateY(0px);
    }
}
.BotYowiAvatar{
    background: #fff8f3;
    box-sizing: border-box;
    border: 5px solid white;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 5px 15px 0 rgba(0,0,0,0.6);
    transform: translateY(0px);
    animation: float 6s ease-in-out infinite;
}
.BotYowiAvatar img {
    width: 93%;
    height: 100%;
}
.BotYowiAvatar video {
    width: 100%;
    height: 100%;
}
.media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 1s ease-in-out;
}
</style>