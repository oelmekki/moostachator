class Mustache
  class Generator
    def on_utag(name)
      if name[2].first == '_i'
        keys = name[2]
        keys.shift

        ev(<<-compiled)
          I18n.t("#{keys.join( '.' )}")
        compiled
      else
        ev(<<-compiled)
          v = #{compile!(name)}
          if v.is_a?(Proc)
            v = Mustache::Template.new(v.call.to_s).render(ctx.dup)
          end
          v.to_s
        compiled
      end
    end

    # An escaped tag.
    def on_etag(name)
      if name[2].first == '_i'
        keys = name[2]
        keys.shift

        ev(<<-compiled)
          v = I18n.t("#{keys.join( '.' )}")
          ctx.escapeHTML(v)
        compiled
      else
        ev(<<-compiled)
          v = #{compile!(name)}
          if v.is_a?(Proc)
            v = Mustache::Template.new(v.call.to_s).render(ctx.dup)
          end
          ctx.escapeHTML(v.to_s)
        compiled
      end
    end
  end
end
