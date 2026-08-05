import React, { useState } from 'react'
import { View } from 'react-native'
import { AppScreen } from '@/shared/components/layout/AppScreen'
import { AppHeader } from '@/shared/components/layout/AppHeader'
import { AppSection } from '@/shared/components/layout/AppSection'
import { AppCard } from '@/shared/components/layout/AppCard'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppIconButton } from '@/shared/components/actions/AppIconButton'
import { AppLink } from '@/shared/components/actions/AppLink'
import { AppInput } from '@/shared/components/forms/AppInput'
import { AppPhoneInput } from '@/shared/components/forms/AppPhoneInput'
import { AppCodeInput } from '@/shared/components/forms/AppCodeInput'
import { AppCheckbox } from '@/shared/components/forms/AppCheckbox'
import { AppRadio } from '@/shared/components/forms/AppRadio'
import { AppSwitch } from '@/shared/components/forms/AppSwitch'
import { AppSelect } from '@/shared/components/forms/AppSelect'
import { AppTag } from '@/shared/components/data-display/AppTag'
import { AppBadge } from '@/shared/components/data-display/AppBadge'
import { AppAvatar } from '@/shared/components/data-display/AppAvatar'
import { AppListItem } from '@/shared/components/data-display/AppListItem'
import { AppStat } from '@/shared/components/data-display/AppStat'
import { AppProgress } from '@/shared/components/feedback/AppProgress'
import { AppAlert } from '@/shared/components/feedback/AppAlert'
import { AppDialog } from '@/shared/components/feedback/AppDialog'
import { AppSkeleton } from '@/shared/components/feedback/AppSkeleton'
import { AppEmptyState } from '@/shared/components/feedback/AppEmptyState'
import { AppErrorState } from '@/shared/components/feedback/AppErrorState'
import { useToast } from '@/shared/components/feedback/AppToast'


/**
 * Development UI Preview Showcase Screen (/dev/ui)
 * Required by Section 22.4 of ui-guide.md
 */
export default function DevUiPreviewRoute() {
  const { showToast } = useToast()
  const [dialogVisible, setDialogVisible] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [radioSelected, setRadioSelected] = useState('a')
  const [switchValue, setSwitchValue] = useState(true)
  const [selectValue, setSelectValue] = useState<string | number>('1')

  return (
    <AppScreen scrollable={true}>
      <AppHeader title="UI Component Showcase" subtitle="Design System & Tokens" />

      {/* Typography */}
      <AppSection title="1. Typography (AppText)">
        <AppCard>
          <AppText variant="display">Display Text (28px)</AppText>
          <AppText variant="title">Title Text (22px)</AppText>
          <AppText variant="heading">Heading Text (18px)</AppText>
          <AppText variant="body">Body Text (16px)</AppText>
          <AppText variant="body-secondary">Body Secondary (14px)</AppText>
          <AppText variant="caption">Caption Text (12px)</AppText>
          <AppText variant="label">Label Text (14px)</AppText>
        </AppCard>
      </AppSection>

      {/* Buttons */}
      <AppSection title="2. Action Buttons (AppButton)">
        <AppCard>
          <View className="space-y-3">
            <AppButton variant="primary">Primary Button</AppButton>
            <AppButton variant="secondary">Secondary Button</AppButton>
            <AppButton variant="outline">Outline Button</AppButton>
            <AppButton variant="danger">Danger Button</AppButton>
            <AppButton variant="ghost">Ghost Button</AppButton>
            <AppButton loading={true}>Loading State</AppButton>
            <AppButton disabled={true}>Disabled State</AppButton>

            <View className="flex-row items-center justify-around py-2">
              <AppIconButton name="heart-outline" accessibilityLabel="收藏" />
              <AppIconButton name="share-social-outline" accessibilityLabel="分享" />
              <AppIconButton name="bookmark-outline" accessibilityLabel="书签" />
            </View>

            <AppLink onPress={() => showToast('点击了文本链接')}>
              这是一个 AppLink 文本链接
            </AppLink>
          </View>
        </AppCard>
      </AppSection>

      {/* Form Controls */}
      <AppSection title="3. Form Inputs (AppInput / Forms)">
        <AppCard>
          <AppInput label="标准输入框" placeholder="请输入内容" showClear={true} />
          <AppPhoneInput label="手机号输入框" />
          <AppCodeInput
            label="验证码输入框"
            onSendCode={() => {
              showToast('验证码已发送')
              return true
            }}
          />
          <AppSelect
            label="选择地区"
            value={selectValue}
            onChange={(val) => setSelectValue(val)}
            options={[
              { label: '北京考区', value: '1' },
              { label: '上海考区', value: '2' },
              { label: '广东考区', value: '3' },
            ]}
          />
          <AppCheckbox
            checked={checkboxChecked}
            onChange={setCheckboxChecked}
            label="已阅读并同意《服务协议》与《隐私政策》"
          />
          <View className="flex-row items-center space-x-4 my-2">
            <AppRadio
              selected={radioSelected === 'a'}
              onSelect={() => setRadioSelected('a')}
              label="选项 A"
            />
            <AppRadio
              selected={radioSelected === 'b'}
              onSelect={() => setRadioSelected('b')}
              label="选项 B"
            />
          </View>
          <AppSwitch
            value={switchValue}
            onValueChange={setSwitchValue}
            label="开启消息通知"
          />
        </AppCard>
      </AppSection>

      {/* Data Display */}
      <AppSection title="4. Data Display (Tags, Badges, Avatar, Stat)">
        <AppCard>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <AppTag variant="primary">单选题</AppTag>
            <AppTag variant="success">正确</AppTag>
            <AppTag variant="danger">错误</AppTag>
            <AppTag variant="warning">待复习</AppTag>
            <AppTag variant="vip">VIP 专属</AppTag>
          </View>

          <View className="flex-row items-center space-x-6 mb-4">
            <AppBadge count={99}>
              <AppAvatar name="张" />
            </AppBadge>
            <AppBadge dot={true}>
              <AppAvatar name="李" />
            </AppBadge>
          </View>

          <View className="flex-row justify-around bg-gray-50 rounded-xl p-2 mb-2">
            <AppStat label="已练题目" value={320} unit="首" tone="primary" />
            <AppStat label="正确率" value="92%" tone="success" />
            <AppStat label="错题数" value={14} tone="danger" />
          </View>

          <AppListItem
            title="考试记录与统计"
            subtitle="查看近30天答题明细"
            leftIcon="stats-chart-outline"
            onPress={() => showToast('点击了列表项')}
          />
        </AppCard>
      </AppSection>

      {/* Feedback */}
      <AppSection title="5. Feedback (Alerts, Progress, Dialog, Toast)">
        <AppCard>
          <AppAlert type="info" message="温馨提示" description="每日刷新 18 道免费练习题" />
          <AppAlert type="warning" message="考前冲刺" description="距离特种作业考试还有 3 天" />
          <AppAlert type="danger" message="未通过" description="本次模拟考试未达到 80 分合格线" />

          <AppProgress progress={68} showLabel={true} className="my-3" />

          <AppButton
            variant="outline"
            onPress={() => setDialogVisible(true)}
            className="my-2"
          >
            打开确认弹窗 (AppDialog)
          </AppButton>

          <AppButton
            variant="secondary"
            onPress={() => showToast({ message: '操作成功！', type: 'success' })}
            className="my-1"
          >
            显示成功 Toast
          </AppButton>

          <AppDialog
            visible={dialogVisible}
            title="确认交卷？"
            description="当前还有 5 道题未回答，确定提交吗？"
            confirmText="确定交卷"
            onConfirm={() => {
              setDialogVisible(false)
              showToast({ message: '交卷成功', type: 'success' })
            }}
            onCancel={() => setDialogVisible(false)}
          />
        </AppCard>
      </AppSection>

      {/* Loading, Empty, Error */}
      <AppSection title="6. Async States (Loading, Empty, Error, Skeleton)">
        <AppCard>
          <AppText variant="label" className="mb-2">
            AppSkeleton 骨架屏：
          </AppText>
          <AppSkeleton height={20} className="mb-2" />
          <AppSkeleton height={14} width="70%" className="mb-4" />

          <AppEmptyState
            title="暂无错题记录"
            description="太棒了，你目前没有任何练习错题！"
            actionLabel="去刷题"
            onAction={() => showToast('去刷题')}
          />

          <AppErrorState
            message="数据加载异常，请检查网络设置"
            onRetry={() => showToast('触发重试')}
          />
        </AppCard>
      </AppSection>
    </AppScreen>
  )
}
