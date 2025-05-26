from django_eventstream.channelmanager import DefaultChannelManager
from PyODM.eventstream import PyODMChannelManager

class DelegatingChannelManager(DefaultChannelManager):

    def __init__(self):
        self.manager_map = {
            "pyodm": PyODMChannelManager,
        }

    def get_manager(self, request, channel: str):
        for prefix, manager_cls in self.manager_map.items():
            if channel.startswith(prefix):
                return manager_cls()
        return DefaultChannelManager()

    def can_read_channel(self, request, channel):
        return self.get_manager(request, channel).can_read_channel(request, channel)

    def on_subscribe(self, request, channel):
        return self.get_manager(request, channel).on_subscribe(request, channel)

    def can_subscribe(self, request, channel):
        return self.get_manager(request, channel).can_subscribe(request, channel)
