import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("today")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ventas del día con desglose por tipo de bebida" })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  getTodaySales() {
    return this.analyticsService.getTodaySales();
  }

  @Get("sales-breakdown")
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Ventas por período (mensual o semanal) con desglose por tipo; no incluye datos futuros",
  })
  @ApiQuery({ name: "year", required: false, type: Number })
  @ApiQuery({ name: "granularity", required: false, enum: ["month", "week", "day"] })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  getSalesByPeriod(
    @Query("year") year?: string,
    @Query("granularity") granularity?: "month" | "week" | "day",
  ) {
    return this.analyticsService.getSalesByPeriod(
      year ? +year : undefined,
      granularity === "week" ? "week" : granularity === "day" ? "day" : "month",
    );
  }

  @Get("sales-by-beverage")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Ventas por período con desglose por bebida (nombre) y serie temporal por bebida",
  })
  @ApiQuery({ name: "year", required: false, type: Number })
  @ApiQuery({ name: "granularity", required: false, enum: ["month", "week", "day"] })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  getSalesByBeverage(
    @Query("year") year?: string,
    @Query("granularity") granularity?: "month" | "week" | "day",
  ) {
    return this.analyticsService.getSalesByBeverage(
      year ? +year : undefined,
      granularity === "week" ? "week" : granularity === "day" ? "day" : "month",
    );
  }

  @Get("top-sellers")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Top vendedores por monto vendido" })
  @ApiQuery({ name: "year", required: false, type: Number })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  getTopSellers(@Query("year") year?: string) {
    return this.analyticsService.getTopSellers(year ? +year : undefined);
  }

  @Get("transactions")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Resumen de transacciones del día" })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  getTransactions() {
    return this.analyticsService.getTransactions();
  }
}
