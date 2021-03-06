import { NbMenuItem } from '@nebular/theme';
import { Params } from '@angular/router';

export function getMenuItems(role: number, queryParams: Params): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'grid-outline',
      link: '/cms/dashboard',
    },
    {
      title: '医院科室管理',
      icon: 'settings-2',
      hidden: role < 2,
      children: [
        {
          title: '医院设置',
          link: '/cms/hospital/settings',
        },
        {
          title: '医院科室',
          link: '/cms/hospital/department',
        },
        // {
        //   title: '疾病类型',
        //   link: '/cms/hospital/disease',
        //   hidden: false
        // },
        {
          title: '药品管理',
          link: '/cms/hospital/medicine',
        },
        {
          title: '化验单模板管理',
          link: '/cms/hospital/test-form',
        },
        {
          title: '常问问题管理',
          link: '/cms/hospital/faq',
        },
      ],
    },
    {
      title: '医患管理',
      icon: 'people-outline',
      children: [
        {
          title: '药师管理',
          link: '/cms/crm/doctor',
          queryParams: queryParams, // dep
        },
        {
          title: '病患管理',
          link: '/cms/crm/patient',
        },
        {
          title: '群组管理',
          link: '/cms/crm/doctor-group',
          queryParams: queryParams,
        },
        {
          title: '病患审核',
          link: '/cms/crm/patient-audit',
        },
        {
          title: '医患关系',
          link: '/cms/crm/relationship',
          queryParams: queryParams,
        },

      ],
    },
    {
      title: '预约管理',
      icon: 'calendar-outline',
      children: [
        {
          title: '门诊开设',
          link: '/cms/reservation/schedule',
          queryParams: queryParams,
        },
        {
          title: '病患预约',
          link: '/cms/reservation/booking',
          queryParams: queryParams,
        },
        {
          title: '门诊时间段',
          link: '/cms/reservation/period',
          hidden: role < 2,
          queryParams: queryParams,
        },
      ],
    },
    {
      title: '咨询管理',
      icon: 'smiling-face-outline',
      children: [
        {
          title: '客服药师设定',
          link: '/cms/consult/customer-service-setting',
        },
        {
          title: '药师服务评价',
          link: '/cms/consult/doctor-rating',
          queryParams: queryParams,
        },
      ],
    },
    {
      title: '问卷&线下咨询管理',
      icon: 'clipboard-outline',
      children: [
        {
          title: '问卷模版',
          link: '/cms/survey/template',
          queryParams: queryParams, // dep
        },
        {
          title: '线下咨询模板',
          link: '/cms/survey/advise-template',
          queryParams: queryParams, // dep
          hidden: role < 1,
        },
      ],
    },
    {
      title: '宣教材料管理',
      icon: 'map-outline',
      children: [
        {
          title: '材料类别',
          link: '/cms/article/cat',
          queryParams: queryParams, // dep
        },
        {
          title: '材料模版',
          link: '/cms/article/template',
          queryParams: queryParams, // dep
        },
      ],
    },
    {
      title: '微信相关管理',
      icon: 'message-circle-outline',
      children: [
        {
          title: '微信失败消息查看',
          icon: 'alert-triangle-outline',
          link: '/cms/msg-failed',
          queryParams: queryParams,
        },
        {
          title: '微信关键字搜索',
          icon: 'search-outline',
          link: '/cms/hospital/wx-keywords',
          hidden: role < 2,
        },
      ],
    },
    {
      title: '统计报表',
      icon: 'pie-chart-2',
      children: [
        {
          title: '咨询服务',
          icon: 'npm-outline',
          children: [
            {
              title: '线下咨询统计',
              link: '/cms/report/advise',
              queryParams: queryParams,
            },
            {
              title: '免费咨询统计',
              link: '/cms/report/chat',
              queryParams: queryParams,
            },
            {
              title: '客服咨询统计',
              link: '/cms/report/chat',
              queryParams: { ...queryParams, cs: true },
            },
            {
              title: '付费咨询统计',
              link: '/cms/report/consult',
              queryParams: queryParams,
            },
            {
              title: '付费咨询对帐单',
              link: '/cms/consult/bill',
              hidden: role < 2,
            },
          ]
        },
        {
          title: '问卷',
          icon: 'npm-outline',
          children: [
            {
              link: '/cms/report/survey',
              title: '问卷类别统计',
              queryParams: queryParams,
            },
            {
              link: '/cms/report/survey-content',
              title: '问卷内容统计',
              queryParams: queryParams,
            }
          ]
        },
        {
          title: '门诊&预约',
          icon: 'npm-outline',
          children: [
            {
              title: '在线预约统计',
              link: '/cms/report/booking',
              queryParams: queryParams,
            },
            {
              title: '门诊就诊统计',
              link: '/cms/report/diagnose',
              queryParams: queryParams,
            },
            {
              title: '不良反应反馈',
              link: '/cms/report/feedback',
              queryParams: { ...queryParams, type: 1 },
            },
            {
              title: '联合用药反馈',
              link: '/cms/report/feedback',
              queryParams: { ...queryParams, type: 2 },
            },
          ]
        },
        {
          title: '药品使用统计',
          link: '/cms/report/medicine-usage',
          queryParams: queryParams,
        },
        {
          title: '化验单使用统计',
          link: '/cms/report/test-usage',
          queryParams: queryParams,
        },
        {
          title: '宣教材料使用统计',
          link: '/cms/report/article-usage',
          queryParams: queryParams,
        },
        {
          title: '病患统计',
          link: '/cms/report/patient',
        },
        {
          title: '药师统计',
          link: '/cms/report/doctor',
        },
      ],
    },
  ];
}
