module Pageflow
  class EntriesController < Pageflow::ApplicationController
    include PublicHttpsMode
    include EntryPasswordProtection

    before_action :authenticate_user!, except: [:index, :show, :stylesheet, :page]

    after_action :allow_iframe_for_embed, only: :show

    helper_method :render_to_string

    helper PagesHelper
    helper NavigationBarHelper
    helper BackgroundImageHelper
    helper RenderJsonHelper

    def index
      theming = Theming.for_request(request).with_home_url.first!

      redirect_to(theming.home_url)
    end

    def show
      respond_to do |format|
        format.html do
          @entry = PublishedEntry.find(params[:id], entry_request_scope)
          I18n.locale = @entry.locale

          if redirect_location = entry_redirect(@entry)
            return redirect_to(redirect_location, status: :moved_permanently)
          end

          return if redirect_according_to_public_https_mode
          check_entry_password_protection(@entry)

          if params[:page].present?
            @entry.share_target = @entry.pages.find_by_perma_id(params[:page])
          else
            @entry.share_target = @entry
          end
        end
      end
    end

    def stylesheet
      respond_to do |format|
        format.css do
          @entry = PublishedEntry.find(params[:id], entry_request_scope)
        end
      end
    end

    def page
      entry = PublishedEntry.find(params[:id], entry_request_scope)
      index = params[:page_index].split('-').first.to_i

      redirect_to(short_entry_path(entry.to_model, :anchor => entry.pages[index].try(:perma_id)))
    end

    def partials
      authenticate_user!
      @entry = DraftEntry.find(params[:id])
      I18n.locale = @entry.locale
      authorize!(:show, @entry.to_model)

      respond_to do |format|
        format.html { render :action => 'partials', :layout => false }
      end
    end

    def edit
      @entry = DraftEntry.find(params[:id])
      authorize!(:edit, @entry.to_model)

      @entry_config = Pageflow.config_for(@entry)
    end

    protected

    def entry_request_scope
      Pageflow.config.public_entry_request_scope.call(Entry, request)
    end

    def entry_redirect(entry)
      Pageflow.config.public_entry_redirect.call(entry, request)
    end

    def allow_iframe_for_embed
      if params[:embed]
        response.headers.except! 'X-Frame-Options'
      end
    end
  end
end
