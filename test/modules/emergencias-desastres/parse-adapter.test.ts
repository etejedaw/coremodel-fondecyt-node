import { DateParserAdapter } from "../../../src/modules/emergencias-desastres/parse-adapter";

const adapter = new DateParserAdapter();

const html = `
<div class="back-fechas">
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">15</span>
        <span class="dat_mes">Mar</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Simulacro de Tsunami</a></h5>
        <h5 class="card-title pb-3">Valdivia</h5>
      </div>
    </div>
  </div>
  <div class="item">
    <div class="card">
      <div class="caja-date">
        <span class="dat_day">20</span>
        <span class="dat_mes">Nov</span>
        <span class="dat_year">2021</span>
      </div>
      <div class="card-body">
        <h5 class="card-title"><a>Simulacro de Terremoto</a></h5>
        <h5 class="card-title pb-3">Santiago</h5>
      </div>
    </div>
  </div>
</div>
`;

describe("DateParserAdapter", () => {
	it("should extract date and place from HTML cards", () => {
		const result = adapter.extract(html);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			date: { day: 15, month: "Mar", year: 2021 },
			place: { type: "Simulacro de Tsunami", city: "Valdivia" }
		});
		expect(result[1]).toEqual({
			date: { day: 20, month: "Nov", year: 2021 },
			place: { type: "Simulacro de Terremoto", city: "Santiago" }
		});
	});

	it("should return empty array when no cards found", () => {
		const result = adapter.extract("<div>empty</div>");
		expect(result).toHaveLength(0);
	});
});
