<template>
    <NavBarPaginasUCT :elementos_dropdown="false">          
      <template #elementos_opcionales>
        <div class="d-flex justify-content-end align-items-center p-0">
          <select v-model="filtroSeleccionado" @change="MostrarTabla" class="form-select">
            <option v-for="(btn, key) in botonesPorDefecto" :key="key" :value="key">
              {{ key }}
            </option>
          </select>
          <ButtonPrimary v-if="filtroSeleccionado != ''"
            iconName="checkbox-checked.svg"
            class="ms-1"
            width_icon="20px"
            :disabled = "registrosSeleccionados[filtroSeleccionado].length == 0"
            @click="FiltrarSeleccionados(filtroSeleccionado)"
          >
            Seleccionados 
            <span v-if="filtroSeleccionado != 'Resumen'" class="badge">{{ registrosSeleccionados[filtroSeleccionado].length }}</span> 
            <span v-else class="badge">{{ TB_Asg_Resumen.registros.length }}</span>        
          </ButtonPrimary>
        </div>             
      </template>       
    </NavBarPaginasUCT> 
    <div>           
      <!-- Divs condicionales basados en la opción seleccionada -->
      <div v-if="filtroSeleccionado === 'Resumen'">
        <div class="p-3">      
            <TablaDinamicaLocal 
                :consultar_registros="TB_Asg_Resumen_filtrar"
                :tablaBase="TB_Asg_Resumen"                         
                @getDataFiltrado="get_data_Resumen"
                tabla_nombre="TB_Asg_Resumen"                        
                @update:consultar_registros="Reset_filtro">
                <template #body>
                    <tr v-for="(registro, index) in data_resumen" :key="index" 
                        :tabindex="index">                                    
                        <td>{{ registro['categoria'] }}</td>                                                      
                        <td>{{ registro['identificador'] }}</td> 
                        <td>{{ registro['descripcion'] }}</td>  
                        <td class="d-flex justify-content-center">
                            <ButtonPrimary
                                iconName="TRASH.svg"
                                class="ms-1"
                                width_icon="20px"                                
                                @click="EliminarRegistroDesdeResumen(registro)"
                            >
                            </ButtonPrimary>
                        </td>                                                     
                    </tr>                                
                </template>
            </TablaDinamicaLocal>
        </div>               
      </div>

      <div v-if="filtroSeleccionado === 'Usuario'">
        <div v-if="cargandoPermisosUsuario" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosUsuario_filtrar"
            :tablaBase="TB_Asg_PermisosUsuario"
            tabla_nombre="TB_Asg_PermisosUsuario"          
            @finalizarRenderBody="finalizarRenderBodyUsuario"
            breakpoint="lg"
          />
          <template v-if="montarChecksUsuario">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosUsuario.registros" :key="'tabscontrol-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosUsuario table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Usuario','ignorar_id_usuario')"
                      @change="seleccionarRegistro(registro,'Usuario','ignorar_id_usuario')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>        
      </div>
  
      <!-- Tabla para Puesto -->
      <div v-if="filtroSeleccionado === 'Puesto'">
        <div v-if="cargandoPermisosPuesto" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosPuesto_filtrar"
            :tablaBase="TB_Asg_PermisosPuesto"
            tabla_nombre="TB_Asg_PermisosPuesto"          
            @finalizarRenderBody="finalizarRenderBodyPuesto"
            breakpoint="lg"
          />
          <template v-if="montarChecksPuesto">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosPuesto.registros" :key="'tabscontrol-puesto-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosPuesto table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Puesto','id_puesto')"
                      @change="seleccionarRegistro(registro,'Puesto','id_puesto')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Departamento -->
      <div v-if="filtroSeleccionado === 'Departamento'">
        <div v-if="cargandoPermisosDepartamento" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosDepartamento_filtrar"
            :tablaBase="TB_Asg_PermisosDepartamento"
            tabla_nombre="TB_Asg_PermisosDepartamento"          
            @finalizarRenderBody="finalizarRenderBodyDepartamento"
            breakpoint="lg"
          />
          <template v-if="montarChecksDepartamento">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosDepartamento.registros" :key="'tabscontrol-departamento-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosDepartamento table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Departamento','id_departamento')"
                      @change="seleccionarRegistro(registro,'Departamento','id_departamento')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Área -->
      <div v-if="filtroSeleccionado === 'Área'">
        <div v-if="cargandoPermisosArea" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosArea_filtrar"
            :tablaBase="TB_Asg_PermisosArea"
            tabla_nombre="TB_Asg_PermisosArea"          
            @finalizarRenderBody="finalizarRenderBodyArea"
            breakpoint="lg"
          />
          <template v-if="montarChecksArea">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosArea.registros" :key="'tabscontrol-area-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosArea table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Área','id_area')"
                      @change="seleccionarRegistro(registro,'Área','id_area')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Oficina -->
      <div v-if="filtroSeleccionado === 'Oficina'">
        <div v-if="cargandoPermisosOficina" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosOficina_filtrar"
            :tablaBase="TB_Asg_PermisosOficina"
            tabla_nombre="TB_Asg_PermisosOficina"          
            @finalizarRenderBody="finalizarRenderBodyOficina"
            breakpoint="lg"
          />
          <template v-if="montarChecksOficina">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosOficina.registros" :key="'tabscontrol-oficina-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosOficina table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Oficina','id_oficina')"
                      @change="seleccionarRegistro(registro,'Oficina','id_oficina')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Sucursal -->
      <div v-if="filtroSeleccionado === 'Sucursal'">
        <div v-if="cargandoPermisosSucursal" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosSucursal_filtrar"
            :tablaBase="TB_Asg_PermisosSucursal"
            tabla_nombre="TB_Asg_PermisosSucursal"          
            @finalizarRenderBody="finalizarRenderBodySucursal"
            breakpoint="lg"
          />
          <template v-if="montarChecksSucursal">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosSucursal.registros" :key="'tabscontrol-sucursal-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosSucursal table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Sucursal','id')"
                      @change="seleccionarRegistro(registro,'Sucursal','id')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Zona -->
      <div v-if="filtroSeleccionado === 'Zona'">
        <div v-if="cargandoPermisosZona" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosZona_filtrar"
            :tablaBase="TB_Asg_PermisosZona"
            tabla_nombre="TB_Asg_PermisosZona"          
            @finalizarRenderBody="finalizarRenderBodyZona"
            breakpoint="lg"
          />
          <template v-if="montarChecksZona">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosZona.registros" :key="'tabscontrol-zona-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosZona table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Zona','id_zona')"
                      @change="seleccionarRegistro(registro,'Zona','id_zona')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
  
      <!-- Tabla para Cliente -->
      <div v-if="filtroSeleccionado === 'Cliente'">
        <div v-if="cargandoPermisosCliente" class="p-3">
          <TablaCargando />
        </div>
        <div v-else class="p-3">
          <TablaDinamica 
            :consultar_registros="TB_Asg_PermisosCliente_filtrar"
            :tablaBase="TB_Asg_PermisosCliente"
            tabla_nombre="TB_Asg_PermisosCliente"          
            @finalizarRenderBody="finalizarRenderBodyCliente"
            breakpoint="lg"
          />
          <template v-if="montarChecksCliente">
            <div>
              <template v-for="(registro, index) in TB_Asg_PermisosCliente.registros" :key="'tabscontrol-cliente-' + registro.id">
                <teleport :to="`#TB_Asg_PermisosCliente table tr:nth-child(${index + 1}) td:last-child div`">
                  <div class="d-flex justify-content-center">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"                                
                      :checked="validarRegistroSeleccionado(registro,'Cliente','id_cliente_empresa')"
                      @change="seleccionarRegistro(registro,'Cliente','id_cliente_empresa')"
                    />                        
                  </div>
                </teleport>
              </template>
            </div>
          </template> 
        </div>
      </div>
    </div>
    
  </template>
  
  <script>
  import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';
  import { useStore } from 'vuex';
  import NavBarPaginasUCT from '@/components/NavBar/NavBarPaginasUCT.vue';
  import TablaCargando from '@/components/TablaDinamica/TablaLoader.vue';
  import TablaDinamica from '@/components/TablaDinamica/TablaDinamica.vue';
  import TablaDinamicaLocal from '@/components/TablaDinamica/TablaDinamicaLocal/TablaDinamicaLocal.vue';
  import ButtonPrimary from '@/components/ButtonWithIcon/ButtonPrimary.vue';
  
  export default defineComponent({
    name: 'AsignacionPermisos',
    components: {
      NavBarPaginasUCT,
      TablaDinamica,
      TablaCargando,
      ButtonPrimary,
      TablaDinamicaLocal,
    },
    props: {
      botones: {
        type: Array,
        default: () => (['Usuario', 'Puesto', 'Departamento', 'Área', 'Oficina', 'Sucursal', 'Zona', 'Cliente']),
      },
      registrosExistentes: {
        type: Object,
        default: () => ({
            //Ejemplo de como deve ser el objeto
          Usuario: [{identificador:1, descripcion:'nombre usuario'}, {identificador:2, descripcion:'nombre usuario'}, {identificador:3, descripcion:'nombre usuario'}, {identificador:4, descripcion:'nombre usuario'}],
          Puesto: [{identificador:2, descripcion:'nombre puesto'}],
          Departamento: [{identificador:3, descripcion:'nombre departamento'}],
          Área: [{identificador:4, descripcion:'nombre area'}],
          Oficina: [{identificador:5, descripcion:'nombre oficina'}],
          Sucursal: [{identificador:6, descripcion:'nombre sucursal'}],
          Zona: [{identificador:9, descripcion:'nombre zona'}],
          Cliente: [{identificador:5, descripcion:'nombre cliente'}],
        }),
      },
    },
    emits: ['ActualizarPermisos'],
    setup(props, { emit }) {
      const store = useStore();
      const filtroSeleccionado = ref('');
      
      const TB_Asg_Resumen = ref();
      const TB_Asg_Resumen_filtrar = ref(false);
      const TB_Asg_PermisosUsuario = ref(null);
      const TB_Asg_PermisosUsuario_filtrar = ref(false);
      const TB_Asg_PermisosPuesto = ref(null);
      const TB_Asg_PermisosPuesto_filtrar = ref(false);
      const TB_Asg_PermisosDepartamento = ref(null);
      const TB_Asg_PermisosDepartamento_filtrar = ref(false);
      const TB_Asg_PermisosArea = ref(null);
      const TB_Asg_PermisosArea_filtrar = ref(false);
      const TB_Asg_PermisosOficina = ref(null);
      const TB_Asg_PermisosOficina_filtrar = ref(false);
      const TB_Asg_PermisosSucursal = ref(null);
      const TB_Asg_PermisosSucursal_filtrar = ref(false);
      const TB_Asg_PermisosZona = ref(null);
      const TB_Asg_PermisosZona_filtrar = ref(false);
      const TB_Asg_PermisosCliente = ref(null);
      const TB_Asg_PermisosCliente_filtrar = ref(false);
      
      const moduloActivo = computed(() => store.getters['user/getModuloActivo']);
      const registrosSeleccionados = ref({Resumen:[],Usuario: [], Puesto: [], Departamento: [], Área: [], Oficina: [], Sucursal: [], Zona: [], Cliente: []});
      const campos_x_categoria = {
        Usuario: 'ignorar_id_usuario',
        Puesto: 'id_puesto',
        Departamento: 'id_departamento',
        Área: 'id_area',
        Oficina: 'id_oficina',
        Sucursal: 'id_sucursal',
        Zona: 'id_zona',
        Cliente: 'id_cliente_empresa'
      };

      const cargandoPermisosUsuario = ref(true);
      const montarChecksUsuario = ref(true);
      const cargandoPermisosPuesto = ref(true);
      const montarChecksPuesto = ref(true);
      const cargandoPermisosDepartamento = ref(true);
      const montarChecksDepartamento = ref(true);
      const cargandoPermisosArea = ref(true);
      const montarChecksArea = ref(true); 
      const cargandoPermisosOficina = ref(true);
      const montarChecksOficina = ref(true); 
      const cargandoPermisosSucursal = ref(true);
      const montarChecksSucursal = ref(true); 
      const cargandoPermisosZona = ref(true);
      const montarChecksZona = ref(true); 
      const cargandoPermisosCliente = ref(true);
      const montarChecksCliente = ref(true); 

      const data_resumen = ref([]);
      const data_resumen_temp = ref([]);
  
      const MostrarTabla = () => {
        montarChecksUsuario.value = false; 
        montarChecksPuesto.value = false;
        montarChecksDepartamento.value = false;
        montarChecksArea.value = false;
        montarChecksOficina.value = false;
        montarChecksSucursal.value = false;
        montarChecksZona.value = false;
        montarChecksCliente.value = false;
        switch (filtroSeleccionado.value) {
            case 'Resumen':
                TB_Asg_Resumen.value.registros = data_resumen_temp.value; 
                TB_Asg_Resumen_filtrar.value = true;
            break;
            case 'Usuario':            
              TB_Asg_PermisosUsuario_filtrar.value = true;
            break; 
            case 'Puesto':
              TB_Asg_PermisosPuesto_filtrar.value = true;
            break;
            case 'Departamento':
              TB_Asg_PermisosDepartamento_filtrar.value = true;
            break;
            case 'Área':
              TB_Asg_PermisosArea_filtrar.value = true;
            break;
            case 'Oficina':
              TB_Asg_PermisosOficina_filtrar.value = true;
            break;
            case 'Sucursal':
              TB_Asg_PermisosSucursal_filtrar.value = true;
            break;
            case 'Zona':
              TB_Asg_PermisosZona_filtrar.value = true;
            break;
            case 'Cliente':
              TB_Asg_PermisosCliente_filtrar.value = true;
            break;
        }    
      };
  
      const botonesPorDefecto = computed(() => {
          let botonesDefecto =  {
              Usuario: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Puesto: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Departamento: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Área: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Oficina: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Sucursal: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Zona: { iconName: 'box_arrow_in_down.svg', registros:[] },
              Cliente: { iconName: 'box_arrow_in_down.svg', registros:[] }
          };
  
          if (props.botones.length > 0) {
              Object.keys(botonesDefecto).map((key) => {
                  if (!props.botones.includes(key)) {
                      delete botonesDefecto[key];
                  }
              });
          }

          //Se agrega el botón de Resumen
          botonesDefecto = {
            Resumen: { iconName: 'box_arrow_in_down.svg', registros:[] },
            ...botonesDefecto
          };
          return botonesDefecto;
      });    

      const Reset_filtro = () =>{
        TB_Asg_Resumen_filtrar.value = false;
      }
  
      const finalizarRenderBodyUsuario = () => {      
        TB_Asg_PermisosUsuario_filtrar.value = false;
        montarChecksUsuario.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosUsuario")) {
                montarChecksUsuario.value = true;
            }
        });
      };
  
      const finalizarRenderBodyPuesto = () => {      
        TB_Asg_PermisosPuesto_filtrar.value = false;
        montarChecksPuesto.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosPuesto")) {
                montarChecksPuesto.value = true;
            }
        });
      };
  
      const finalizarRenderBodyDepartamento = () => {      
        TB_Asg_PermisosDepartamento_filtrar.value = false;
        montarChecksDepartamento.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosDepartamento")) {
                montarChecksDepartamento.value = true;
            }
        });
      };
  
      const finalizarRenderBodyArea = () => {      
        TB_Asg_PermisosArea_filtrar.value = false;
        montarChecksArea.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosArea")) {
                montarChecksArea.value = true;
            }
        });
      };
  
      const finalizarRenderBodyOficina = () => {      
        TB_Asg_PermisosOficina_filtrar.value = false;
        montarChecksOficina.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosOficina")) {
                montarChecksOficina.value = true;
            }
        });
      };
  
      const finalizarRenderBodySucursal = () => {      
        TB_Asg_PermisosSucursal_filtrar.value = false;
        montarChecksSucursal.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosSucursal")) {
                montarChecksSucursal.value = true;
            }
        });
      };
  
      const finalizarRenderBodyZona = () => {      
        TB_Asg_PermisosZona_filtrar.value = false;
        montarChecksZona.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosZona")) {
                montarChecksZona.value = true;
            }
        });
      };
  
      const finalizarRenderBodyCliente = () => {      
        TB_Asg_PermisosCliente_filtrar.value = false;
        montarChecksCliente.value = false;
        nextTick(() => {
            if (document.getElementById("TB_Asg_PermisosCliente")) {
                montarChecksCliente.value = true;
            }
        });
      };
  
      onMounted(() => {
        let filtroInicial = Object.keys(botonesPorDefecto.value)[0];
  
        store.dispatch('reporteador/agregarDataReporteadorModulo', {
          modulo: moduloActivo.value.modulo_nombre,
          sistema: moduloActivo.value.sistema,
          token: store.state.user.token,
          tablas_nombres: [
            'TB_Asg_Resumen',
            'TB_Asg_PermisosUsuario',
            'TB_Asg_PermisosPuesto',
            'TB_Asg_PermisosDepartamento',
            'TB_Asg_PermisosArea',
            'TB_Asg_PermisosOficina',
            'TB_Asg_PermisosSucursal',
            'TB_Asg_PermisosZona',
            'TB_Asg_PermisosCliente'
          ],
          formularios_nombres: [],
        }).then(() => {
          
          TB_Asg_Resumen.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_Resumen');
          TB_Asg_PermisosUsuario.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosUsuario');
          TB_Asg_PermisosPuesto.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosPuesto');
          TB_Asg_PermisosDepartamento.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosDepartamento');
          TB_Asg_PermisosArea.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosArea');
          TB_Asg_PermisosOficina.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosOficina');
          TB_Asg_PermisosSucursal.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosSucursal');
          TB_Asg_PermisosZona.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosZona');
          TB_Asg_PermisosCliente.value = store.getters['reporteador/getTablaPorNombre']('TB_Asg_PermisosCliente');

          limpiarColumnasDeTodasLasTablas();
          
          cargandoPermisosUsuario.value = false;
          cargandoPermisosPuesto.value = false;
          cargandoPermisosDepartamento.value = false;
          cargandoPermisosArea.value = false;
          cargandoPermisosOficina.value = false;
          cargandoPermisosSucursal.value = false;
          cargandoPermisosZona.value = false;
          cargandoPermisosCliente.value = false;
          
          filtroSeleccionado.value = filtroInicial;
          MostrarTabla();     
          
        });

        
  
        
        Object.keys(registrosSeleccionados.value).map((key) => {
            if (props.registrosExistentes[key] != undefined) {
                let identificadores = [];
                props.registrosExistentes[key].map((item) => {
                    identificadores.push(item.identificador);
                    data_resumen_temp.value.push({categoria: key, identificador: item.identificador, descripcion: item.descripcion});
                });
                registrosSeleccionados.value[key] = identificadores;
                
            }
        });         
      });

      const limpiarColumnasDeTodasLasTablas = () => {
        
        let jsonTB_Asg_Resumen = JSON.parse(TB_Asg_Resumen.value.json_tabla);
        let jsonTB_Asg_PermisosUsuario = JSON.parse(TB_Asg_PermisosUsuario.value.json_tabla);
        let jsonTB_Asg_PermisosPuesto = JSON.parse(TB_Asg_PermisosPuesto.value.json_tabla);
        let jsonTB_Asg_PermisosDepartamento = JSON.parse(TB_Asg_PermisosDepartamento.value.json_tabla);
        let jsonTB_Asg_PermisosArea = JSON.parse(TB_Asg_PermisosArea.value.json_tabla);
        let jsonTB_Asg_PermisosOficina = JSON.parse(TB_Asg_PermisosOficina.value.json_tabla);
        let jsonTB_Asg_PermisosSucursal = JSON.parse(TB_Asg_PermisosSucursal.value.json_tabla);
        let jsonTB_Asg_PermisosZona = JSON.parse(TB_Asg_PermisosZona.value.json_tabla);
        let jsonTB_Asg_PermisosCliente = JSON.parse(TB_Asg_PermisosCliente.value.json_tabla);

        jsonTB_Asg_Resumen.columnas.map((columna) => {
            columna.valor = '';
        });
        
        jsonTB_Asg_PermisosUsuario.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosPuesto.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosDepartamento.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosArea.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosOficina.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosSucursal.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosZona.columnas.map( (columna) => {
            columna.valor = '';
        });
        jsonTB_Asg_PermisosCliente.columnas.map( (columna) => {
            columna.valor = '';
        });
        
        TB_Asg_Resumen.value.json_tabla = JSON.stringify(jsonTB_Asg_Resumen);
        TB_Asg_PermisosUsuario.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosUsuario);
        TB_Asg_PermisosPuesto.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosPuesto);
        TB_Asg_PermisosDepartamento.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosDepartamento);
        TB_Asg_PermisosArea.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosArea);
        TB_Asg_PermisosOficina.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosOficina);
        TB_Asg_PermisosSucursal.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosSucursal);
        TB_Asg_PermisosZona.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosZona);
        TB_Asg_PermisosCliente.value.json_tabla = JSON.stringify(jsonTB_Asg_PermisosCliente);

      }
  
      const validarRegistroSeleccionado = (registro, tipo, name_campo_comparar) => {
          //let jsonTipo = props.registrosExistentes[tipo].map((item) => item.identificador);
          let jsonTipo = registrosSeleccionados.value[tipo];
          if(jsonTipo == undefined){
              return false;
          }
            return jsonTipo.includes(registro[name_campo_comparar]);
          /*if(jsonTipo == undefined){
              return false;
          }
          return jsonTipo.includes(registro[name_campo_comparar]);*/
      };
  
      const seleccionarRegistro = (registro, tipo, name_campo_comparar) => {
          let jsonTipo = registrosSeleccionados.value[tipo];
          let descripcion_x_tipo = {
            Usuario: 'nombre',
            Puesto: 'nombre_puesto',
            Departamento: 'nombre_departamento',
            Área: 'nombre_area',
            Oficina: 'nombre_oficina',
            Sucursal: 'nombre_sucursal',
            Zona: 'nombre_zona',
            Cliente: 'nombre_empresa'
          };
          if(jsonTipo == undefined){
              return false;
          }
          let index = jsonTipo.indexOf(registro[name_campo_comparar]);
          if (index === -1) {
              jsonTipo.push(registro[name_campo_comparar]);    
              //Se agrega el registro a TB_Asg_Resumen.value.registros
              TB_Asg_Resumen.value.registros.push({categoria: tipo, identificador: registro[name_campo_comparar], descripcion: registro[descripcion_x_tipo[tipo]]});          
          } else {
              jsonTipo.splice(index, 1);
                //Se elimina el registro de TB_Asg_Resumen.value.registros
                TB_Asg_Resumen.value.registros.map((item, index) => {
                    if (item.categoria == tipo && item.identificador == registro[name_campo_comparar]) {
                        TB_Asg_Resumen.value.registros.splice(index, 1);
                    }
                });
          }

          emit('ActualizarPermisos', registrosSeleccionados.value);
          
        };

      const EliminarRegistroDesdeResumen = (registro) => {
        let index = TB_Asg_Resumen.value.registros.indexOf(registro);
        if (index > -1) {
            TB_Asg_Resumen.value.registros.splice(index, 1);
            TB_Asg_Resumen_filtrar.value = true;

            //Tambien se elimina del array data_resumen_temp
            //data_resumen_temp.value = data_resumen_temp.value.filter(item => item.identificador != registro.identificador);
            
            //Se elimina tambien de registrosSeleccionados.value[registro['categoria']]
            let indexrs = registrosSeleccionados.value[registro['categoria']].indexOf(registro.identificador);
            if (indexrs > -1) {
                registrosSeleccionados.value[registro['categoria']].splice(indexrs, 1);
            }
        }
        emit('ActualizarPermisos', registrosSeleccionados.value);
      };
  
      const FiltrarSeleccionados = (filtro) => {
        const filtrosConfig = {
          Usuario: {
            tabla: TB_Asg_PermisosUsuario,
            registros: registrosSeleccionados.value.Usuario,
            campo: 'id_usuario',
            filtrar: TB_Asg_PermisosUsuario_filtrar
          },
          Puesto: {
            tabla: TB_Asg_PermisosPuesto,
            registros: registrosSeleccionados.value.Puesto,
            campo: 'id_puesto',
            filtrar: TB_Asg_PermisosPuesto_filtrar
          },
          Departamento: {
            tabla: TB_Asg_PermisosDepartamento,
            registros: registrosSeleccionados.value.Departamento,
            campo: 'id_departamento',
            filtrar: TB_Asg_PermisosDepartamento_filtrar
          },
          Área: {
            tabla: TB_Asg_PermisosArea,
            registros: registrosSeleccionados.value.Área,
            campo: 'id_area',
            filtrar: TB_Asg_PermisosArea_filtrar
          },
          Oficina: {
            tabla: TB_Asg_PermisosOficina,
            registros: registrosSeleccionados.value.Oficina,
            campo: 'id_oficina',
            filtrar: TB_Asg_PermisosOficina_filtrar
          },
          Sucursal: {
            tabla: TB_Asg_PermisosSucursal,
            registros: registrosSeleccionados.value.Sucursal,
            campo: 'id_sucursal',
            filtrar: TB_Asg_PermisosSucursal_filtrar
          },
          Zona: {
            tabla: TB_Asg_PermisosZona,
            registros: registrosSeleccionados.value.Zona,
            campo: 'id_zona',
            filtrar: TB_Asg_PermisosZona_filtrar
          },
          Cliente: {
            tabla: TB_Asg_PermisosCliente,
            registros: registrosSeleccionados.value.Cliente,
            campo: 'id_cliente',
            filtrar: TB_Asg_PermisosCliente_filtrar
          }
        };
  
        const config = filtrosConfig[filtro];
  
        if (config) {
          let jsonTB = JSON.parse(config.tabla.value.json_tabla);
          const { campo, registros } = config;
  
          // Verificar si jsonTB.where ya tiene valores y vaciarlo si es necesario
          if (jsonTB.where && jsonTB.where.length > 0) {
            jsonTB.where = [];
          } else {
            jsonTB.where = [{
              regla: 'IN',
              campo: campo,
              valor: registros
            }];
          }
  
          config.tabla.value.json_tabla = JSON.stringify(jsonTB);
          config.filtrar.value = true;
        }
      };

      const get_data_Resumen = (data) => {
        data_resumen.value = data;
      };
  
      return {
        filtroSeleccionado,
        MostrarTabla,
        botonesPorDefecto,
        TB_Asg_PermisosUsuario,
        TB_Asg_PermisosPuesto,
        TB_Asg_PermisosDepartamento,
        TB_Asg_PermisosArea,
        TB_Asg_PermisosOficina,
        TB_Asg_PermisosSucursal,
        TB_Asg_PermisosZona,
        TB_Asg_PermisosCliente,
        TB_Asg_PermisosUsuario_filtrar,
        TB_Asg_PermisosPuesto_filtrar,
        TB_Asg_PermisosDepartamento_filtrar,
        TB_Asg_PermisosArea_filtrar,
        TB_Asg_PermisosOficina_filtrar,
        TB_Asg_PermisosSucursal_filtrar,
        TB_Asg_PermisosZona_filtrar,
        TB_Asg_PermisosCliente_filtrar,
        finalizarRenderBodyUsuario,
        finalizarRenderBodyPuesto,
        finalizarRenderBodyDepartamento,
        finalizarRenderBodyArea,
        finalizarRenderBodyOficina,
        finalizarRenderBodySucursal,
        finalizarRenderBodyZona,
        finalizarRenderBodyCliente,
        cargandoPermisosUsuario,
        cargandoPermisosPuesto,
        cargandoPermisosDepartamento,
        cargandoPermisosArea,
        cargandoPermisosOficina,
        cargandoPermisosSucursal,
        cargandoPermisosZona,
        cargandoPermisosCliente,
        validarRegistroSeleccionado,
        montarChecksUsuario,
        montarChecksPuesto,
        montarChecksDepartamento,
        montarChecksArea,
        montarChecksOficina,
        montarChecksSucursal,
        montarChecksZona,
        montarChecksCliente,
        seleccionarRegistro,
        registrosSeleccionados,
        FiltrarSeleccionados,

        //Tabla de Resumen
        TB_Asg_Resumen,
        TB_Asg_Resumen_filtrar,
        Reset_filtro,
        data_resumen,
        get_data_Resumen,
        campos_x_categoria,
        EliminarRegistroDesdeResumen,
      };
    },
  });
  </script>
  
  <style scoped>
  .d-flex {
    display: flex;
  }
  
  .flex-wrap {
    flex-wrap: wrap;
  }
  
  .justify-content-around {
    justify-content: space-around;
  }
  
  .form-select {
    width: 200px;
    padding: 5px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ced4da;
  }
  
  .form-select:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
  </style>
  