<template>
    <div>
        <div class="toolbar">
            <button @click="execCommand('bold')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/type-bold"
                />
            </button>
            <button @click="execCommand('italic')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/type-italic"
                />
            </button>
            <button @click="execCommand('underline')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/type-underline"
                />
            </button>
            <select v-model="currentBlock" @change="handleFormatBlockChange">
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
            </select>
            <button @click="execCommand('insertOrderedList')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/list-ol"
                />
            </button>
            <button @click="execCommand('insertUnorderedList')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/list-ul"
                />
            </button>
            <button @click="execCommand('justifyLeft')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/text-left"
                />
            </button>
            <button @click="execCommand('justifyCenter')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/text-center"
                />
            </button>
            <button @click="execCommand('justifyRight')">
                <LoaderSVG
                    class="icono" width_icon="25px" fileName="icons/UCT_Panel/text-right"
                />
            </button>
            <input type="color" @input="execCommand('foreColor', $event.target.value)" />
        </div>
        <div ref="editor" class="editor" contenteditable="true" @input="updateContent" @keyup="updateCurrentBlock" @mouseup="updateCurrentBlock"></div>
    </div>
</template>

<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import LoaderSVG from '../LoaderSVG/LoaderSVG.vue';

export default defineComponent({
    props:{
        modelValue: {
            type: String,
            required: true
        }
    },
    components: {
        LoaderSVG
    },
    setup(props, { emit }) {
        const editor = ref(null);
        const currentBlock = ref('p');

        const execCommand = (command, value = null) => {
            document.execCommand(command, false, value);
            updateContent();
            updateCurrentBlock();
        };

        const handleFormatBlockChange = (event) => {
            const block = event.target.value;
            execCommand('formatBlock', block);
        };

        const updateContent = () => {
            emit('update:modelValue', editor.value.innerHTML);
        };

        const updateCurrentBlock = () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const parentElement = selection.getRangeAt(0).startContainer.parentElement;
                const blockTag = parentElement.closest('p, h1, h2, h3, h4, h5, h6');
                if (blockTag) {
                    currentBlock.value = blockTag.tagName.toLowerCase();
                }else {
                    currentBlock.value = 'p';
                }
            }
        };

        watch(() => props.modelValue, (newValue) => {
            if (editor.value && editor.value.innerHTML !== newValue) {
                editor.value.innerHTML = newValue;
            }
        });

        onMounted(() => {
            if (editor.value) {
                editor.value.innerHTML = props.modelValue;
            }
            updateCurrentBlock();
        });

        return {
            editor,
            currentBlock,
            execCommand,
            handleFormatBlockChange,
            updateContent,
            updateCurrentBlock
        }
    }
});
</script>

<style scoped>
.toolbar {
    display: flex;
    flex-wrap: wrap;
    background: rgb(218,215,245);
    padding: 10px;
    border-bottom: 1px solid rgb(190, 183, 255);
    width: 100%;
    border-radius: 10px 10px 0 0;
}

.toolbar button, .toolbar select, .toolbar input[type="color"] {
    margin-right: 5px;
    border: none;
    background: rgb(190, 183, 255);
    cursor: pointer;
}

.editor {
    height: 300px;
    width: 100%;
    border: 1px solid rgb(190, 183, 255);
    padding: 10px;
    overflow-y: auto;
    border-radius: 0 0 10px 10px;
}
.icono{
    padding: unset;
    fill: var(--black);
}
</style>