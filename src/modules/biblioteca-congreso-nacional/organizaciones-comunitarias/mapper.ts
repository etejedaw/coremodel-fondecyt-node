import { MapperAdapter } from "../../../core/adapters/mapper-adapter/MapperAdapter";
import { Input, Output } from "./interfaces";

export class OrganizacionesComunitariasMapperAdapter implements MapperAdapter {
	map(data: Input): Output {
		return {
			nDeCentrosDeMadres: Number(data.n_de_centros_de_madres) || 0,
			nDeOtrasOrganizacionesComunitariasFuncionalesOtros:
				Number(data.n_de_otras_organizaciones_comunitarias_funcionales_otros) ||
				0,
			nDeCentrosDePadresYApoderados:
				Number(data.n_de_centros_de_padres_y_apoderados) || 0,
			nDeUnionesComunales: Number(data.n_de_uniones_comunales) || 0,
			nDeJuntasDeVecinos: Number(data.n_de_juntas_de_vecinos) || 0,
			nCentrosCulturales: Number(data.n_centros_culturales) || 0,
			nDeOrganizacionesComunitariasSumaTotal:
				Number(data.n_de_organizaciones_comunitarias_suma_total) || 0,
			nDeClubesDeportivos: Number(data.n_de_clubes_deportivos) || 0,
			nDeCentrosUOrganizacionesDelAdultoMayor:
				Number(data.n_de_centros_u_organizaciones_del_adulto_mayor) || 0,
			nDeCompaniasDeBomberos: Number(data.n_de_companias_de_bomberos) || 0,
			anio: Number(data.anio)
		};
	}
}
