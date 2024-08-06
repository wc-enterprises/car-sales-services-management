import { AuthMockApi } from "app/services/common/auth/api";
import { MessagesMockApi } from "app/services/common/messages/api";
import { NavigationMockApi } from "app/services/common/navigation/api";
import { NotificationsMockApi } from "app/services/common/notifications/api";
import { ShortcutsMockApi } from "app/services/common/shortcuts/api";
import { UserMockApi } from "app/services/common/user/api";
import { AnalyticsMockApi } from "app/services/dashboards/analytics/api";
import { FinanceMockApi } from "app/services/dashboards/finance/api";
import { ProjectMockApi } from "app/services/dashboards/project/api";

export const mockApiServices = [
  AnalyticsMockApi,
  AuthMockApi,
  FinanceMockApi,
  MessagesMockApi,
  NavigationMockApi,
  NotificationsMockApi,
  ProjectMockApi,
  ShortcutsMockApi,
  UserMockApi,
];
