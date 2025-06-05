from django_eventstream.channelmanager import DefaultChannelManager
from PyODM.sse import PyODMChannelManager

class DelegatingChannelManager(DefaultChannelManager):

    manager_map = {
        "pyodm": PyODMChannelManager,
        "notifications": NotificationsChannelManager,
    }

    def get_manager(self, channel):
        for prefix, manager_cls in self.manager_map.items():
            if channel.startswith(prefix):
                return manager_cls()
        return DefaultChannelManager()

    def can_read_channel(self, user, channel):
        return self.get_manager(channel).can_read_channel(user, channel)


class NotificationsChannelManager:

    def can_read_channel(self, user, channel):
        return user.is_authenticated