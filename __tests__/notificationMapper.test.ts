import { isApiSuccess } from '../src/API/types';
import {
  applyNotificationRead,
  extractReadNotification,
  formatNotificationTime,
  mapNotifications,
  pickUnreadCount,
  type NotificationsResponse,
} from '../src/API/mappers/notificationMapper';

const LIVE_LIST: NotificationsResponse = {
  success: 200,
  unread_count: 1,
  notifications: [
    {
      id: 33,
      title: 'New Account',
      message: 'Your account has been created',
      is_read: false,
      read_at: null,
      created_at: '2026-08-25 13:27:43',
    },
  ],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 1,
  },
};

describe('GET /notifications', () => {
  it('treats HTTP 200 and body success: 200 as success', () => {
    expect(isApiSuccess(200, 200)).toBe(true);
  });

  it('maps the live GET /notifications payload onto the card', () => {
    const items = mapNotifications(LIVE_LIST);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('33');
    expect(items[0].title).toBe('New Account');
    expect(items[0].description).toBe('Your account has been created');
    expect(items[0].unread).toBe(true);
    expect(items[0].time).toBeTruthy();
    expect(items[0].icon).toBe('account-outline');
    expect(pickUnreadCount(LIVE_LIST, items)).toBe(1);
  });

  it('maps extra fields onto the existing card when the API sends them', () => {
    const items = mapNotifications({
      success: 200,
      notifications: [
        {
          id: 1,
          title: 'Package Reminder',
          message: 'Upgrade your package to view more profile details.',
          is_read: false,
          created_at: 'Yesterday',
          action_label: 'Upgrade Now',
          type: 'package',
        },
      ],
    });

    expect(items[0].unread).toBe(true);
    expect(items[0].time).toBe('Yesterday');
    expect(items[0].actionLabel).toBe('Upgrade Now');
    expect(items[0].icon).toBe('gift-outline');
  });
});

describe('POST /notifications/{id}/read', () => {
  it('marks the matching card as read from the response notification', () => {
    const updated = applyNotificationRead(
      [
        {
          id: '32',
          icon: 'bell-outline',
          title: 'Test',
          description: 'Testing',
          time: '',
          unread: true,
          type: '',
        },
      ],
      '32',
      extractReadNotification({
        success: 200,
        message: 'Notification marked as read.',
        notification: {
          id: 32,
          is_read: true,
          read_at: '2026-08-25 08:01:54',
        },
      }),
    );

    expect(updated[0].unread).toBe(false);
  });
});

describe('notification time formatting', () => {
  it('keeps relative strings from the API', () => {
    expect(formatNotificationTime('2m')).toBe('2m');
    expect(formatNotificationTime('Yesterday')).toBe('Yesterday');
  });
});
