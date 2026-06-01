import { dashboardRepository } from "./dashboard.repository";

export const dashboardService = {
  stats: async (params: { dateFrom?: string; dateTo?: string } = {}) => {
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined;
    const dateTo = params.dateTo ? new Date(params.dateTo) : undefined;
    const [
      totalEmployees,
      totalPendingLeaves,
      approvedThisMonth,
      leaveSummaryByDepartment,
      leaveSummaryByStatus,
      recentLeaves,
      pendingApprovals,
      upcomingLeaves,
      recentActivity
    ] = await Promise.all([
      dashboardRepository.countActiveEmployees(),
      dashboardRepository.countPendingLeaves(),
      dashboardRepository.countApprovedLeavesThisMonth(dateFrom, dateTo),
      dashboardRepository.countLeavesByDepartment(dateFrom, dateTo),
      dashboardRepository.countLeavesByStatus(dateFrom, dateTo),
      dashboardRepository.recentLeaves(5, dateFrom, dateTo),
      dashboardRepository.pendingApprovals(),
      dashboardRepository.upcomingLeaves(),
      dashboardRepository.recentActivity()
    ]);

    const serializeLeave = (leave: (typeof recentLeaves)[number]) => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      department: leave.employee.department,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status,
      reviewNote: leave.reviewNote,
      createdAt: leave.createdAt
    });

    return {
      totalEmployees,
      totalPendingLeaves,
      totalApprovedLeavesThisMonth: approvedThisMonth,
      leaveSummaryByDepartment,
      leaveSummaryByStatus: {
        PENDING: leaveSummaryByStatus.PENDING || 0,
        APPROVED: leaveSummaryByStatus.APPROVED || 0,
        REJECTED: leaveSummaryByStatus.REJECTED || 0,
        CANCELED: leaveSummaryByStatus.CANCELED || 0
      },
      recentLeaves: recentLeaves.map(serializeLeave),
      pendingApprovals: pendingApprovals.map(serializeLeave),
      upcomingLeaves: upcomingLeaves.map(serializeLeave),
      recentActivity
    };
  }
};
