class TablaDatosAire extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });   

    const style = `
      table, th, td {
        border: 1px solid blue;
        border-collapse: collapse;
        padding: 10px;
      }
      
      input {
        margin-bottom: 10px;
        padding: 5px;
      }
    `;

    const html = `
      <input type="text" placeholder="Busca por nombre" />
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>ID</th>
            <th>Fecha</th>
            <th>Valor</th>
            <th>Unidad</th>
            <th>Contaminante</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    this.shadowRoot.innerHTML = `     
      <style>${style} </style>
      ${html}
    `;
  }

  connectedCallback() {
    this.input = this.shadowRoot.querySelector("input");
    this.input.addEventListener("input", () => this.render());

    this.tbody = this.shadowRoot.querySelector("tbody");

    this.render();
  }

  async getCalidadDatos() {
    const response = await fetch(
      "https://api.datos.gob.mx/v1/calidadAire"
    );
    const data = await response.json();
    return data.results;
  }

  async render() {
    const calidadDatos = await this.getCalidadDatos();

    const buscaValor = this.input.value.toLowerCase();

    const filtrarDatos = calidadDatos.filter((station) =>
      station.stations.some((s) => s.name.toLowerCase().includes(buscaValor))
    );

    const tableRows = filtrarDatos.flatMap((station) =>
      station.stations.flatMap((s) =>
        s.measurements.map(
          (m) =>
            `
            <tr>
              <td>${s.name}</td>
              <td>${s.id}</td>
              <td>${new Date(m.time).toLocaleString()}</td>
              <td>${m.value}</td>
              <td>${m.unit}</td>
              <td>${m.pollutant}</td>
              
            </tr>
          `
        )
      )
    );

    this.tbody.innerHTML = tableRows.join("");
  }
}

customElements.define("tabla-calidad-aire", TablaDatosAire);