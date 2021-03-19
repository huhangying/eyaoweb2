import { NbMenuItem } from '@nebular/theme';
import { Params } from '@angular/router';

export function getMenuItems(role: number, queryParams: Params, isCs = false): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'grid-outline',
      link: '/main/dashboard',
    },
    {
      title: '药师门诊',
      icon: 'headphones-outline',
      link: '/main/diagnose',
    },
    {
      title: '线下咨询',
      icon: 'person-done-outline',
      link: '/main/advise',
    },
    {
      title: '病患档案',
      icon: 'search',
      link: '/main/patient-search',
    },
    {
      title: '在线咨询',
      icon: 'message-circle-outline',
      link: '/main/chat',
    },
    {
      title: '客服和咨询监管',
      icon: 'smiling-face-outline',
      link: '/main/chat',
      hidden: !isCs,
      queryParams: { ...queryParams, type: 0, cs: true },
    },
    {
      title: '付费咨询设置',
      icon: 'award-outline',
      link: '/main/consult',
    },
    {
      title: '预约管理',
      icon: 'calendar-outline',
      children: [
        {
          title: '门诊开设',
          link: '/main/reservation/schedule',
          queryParams: queryParams,
        },
        {
          title: '病患预约',
          link: '/main/reservation/booking',
          queryParams: queryParams,
        },
      ],
    },
    {
      title: '医患管理',
      icon: 'people-outline',
      children: [
        {
          title: '群组管理',
          link: '/main/crm/doctor-group',
          queryParams: queryParams,
        },
        {
          title: '病患审核',
          link: '/main/crm/patient-audit',
        },
        {
          title: '医患关系',
          link: '/main/crm/relationship',
          queryParams: queryParams,
        },

      ],
    },
    {
      title: '宣教材料推送',
      icon: 'map-outline',
      link: '/main/article-push',
    },
    {
      title: '问卷',
      icon: 'clipboard-outline',
      children: [
        {
          title: '问卷发送',
          link: '/main/survey-push',
        },
        {
          title: '问卷查询',
          link: '/main/survey-query',
          queryParams: queryParams,
        },
      ]
    },
    {
      title: '快捷回复管理',
      icon: 'undo-outline',
      link: '/main/shortcuts',
    },
    {
      title: '微信失败消息查看',
      icon: 'alert-triangle-outline',
      link: '/main/msg-failed',
      queryParams: queryParams,
    },
    {
      title: '工作量统计',
      icon: 'pie-chart-2',
      children: [
        {
          title: '门诊',
          link: '/main/work/diagnose',
          queryParams: queryParams,
        },
        {
          title: '线下咨询',
          link: '/main/work/advise',
          queryParams: queryParams,
        },
        {
          title: '付费咨询',
          link: '/main/work/consult',
          queryParams: queryParams,
        },

      ],
    },
  ];
}
